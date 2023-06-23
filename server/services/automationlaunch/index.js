import dayjs from 'dayjs';
import { DEFAULT_ALAUNCH_NAME, DEFAULT_PAGE_SIZE } from '../../config';
import { Activity } from '../../models/mongoose/activity';
import { AutomationLaunch } from '../../models/mongoose/automation_launch';
import { ProjectBuild } from '../../models/mongoose/build';
import { ProjectRun } from '../../models/mongoose/run';
import { Sprint } from '../../models/mongoose/sprint';
import { automationLaunchSchemaJoi } from '../../models/schema/automation_launch';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import { createRun } from '../projectRun';

export async function createLaunch(launchData, tenantId) {
	try {
		const _res = await automationLaunchSchemaJoi.validate(launchData);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findOne({ display_id: launchData.project_code });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const _sprint = await Sprint.find({ start_date: { $lte: dayjs().format() }, project_id: project.id })
			.sort({ start_date: 'desc' })
			.limit(1);
		if (_sprint.length === 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		let _run = null;

		const build = await ProjectBuild.findOne({ build_number: launchData.build_number, project_id: project.id, sprint: _sprint[0].id });

		if (!build) return Promise.reject(generateBadRequestResponse(new Error(), 'Build not found'));

		const activity = await Activity.findOne({ display_id: launchData.activity_id, project_id: project.id, sprint: _sprint[0].id, build: build._id });

		if (!activity) return Promise.reject(generateBadRequestResponse(new Error(), 'Activity not found'));

		_run = await ProjectRun.findOne({ run_name: launchData.run_name, activity: activity.id });
		if (!_run) {
			const runInfo = {
				activity_id: String(activity._id),
				project_id: project.id,
				project_code: project.display_id
			};
			_run = await createRun(runInfo, tenantId);
		}

		let launchName = null;
		const prevLaunch = await AutomationLaunch
			.find({ run: _run._id })
			.sort({ createdAt: 'desc' })
			.limit(1);

		if (prevLaunch.length === 0) launchName = DEFAULT_ALAUNCH_NAME.FIRST_MLAUNCH_NAME;
		else {
			const prevLaunchName = prevLaunch[0].launch_name;
			const id = Number(prevLaunchName.slice(8));
			launchName = DEFAULT_ALAUNCH_NAME.PREFIX + (id + 1);
		}

		const _launch = {
			project_id: project.id,
			project_code: project.display_id,
			build: build._id,
			run: _run._id,
			launch_name: launchName,
			source: launchData.source,
			suite_name: launchData.suite_name,
			start_time: launchData.start_time,
			tenant_id: tenantId,
			sprint: build.sprint,
			activity: _run.activity,
			environment: launchData.environment
		};
		const launch = await AutomationLaunch.create(_launch);
		return Promise.resolve(launch._id);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createLaunch'));
	}
}
export async function getLaunches(runId, key, startDate, source, pageSize, pageNumber, tenantId) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { run: runId, tenant_id: tenantId };

		const qb = AutomationLaunch.find(query);
		if (key) {
			query.launch_name = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ launch_name: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}
		if (startDate) {
			query.start_time = { $gte: dayjs(startDate).startOf('day').format(), $lte: dayjs(startDate).endOf('day').format() };
			qb.find({ start_time: { $gte: dayjs(startDate).startOf('day').format(), $lte: dayjs(startDate).endOf('day').format() } });
		}
		if (source) {
			query.source = source;
			qb.find({ source: source });
		}
		const launches = await qb.sort({ createdAt: 'desc' }).limit(pageSize).skip(pageNumber * pageSize);
		const count = await AutomationLaunch.countDocuments(query);
		const result = {
			launches: launches,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getLaunches'));
	}
}

export async function updateLaunch(launchId, launchInfo, tenantId) {
	try {
		const launch = await AutomationLaunch.findById(launchId).populate('sprint');
		if (!launch) return Promise.reject(generateBadRequestResponse(new Error(), 'Launch not found'));

		if (launch.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const sprint = launch.sprint;

		const _sprint = await Sprint.find({ start_date: { $lte: dayjs().format() }, project_id: launch.project_id })
			.sort({ start_date: 'desc' })
			.limit(1);
		if (_sprint.length === 0) return Promise.reject(generateBadRequestResponse(new Error(), 'Sprint not found'));

		if (sprint.id !== _sprint[0].id) return Promise.reject(generateBadRequestResponse(new Error(), 'Select a matrix under current sprint'));

		await AutomationLaunch.updateOne({ _id: launchId },
			{
				overallstatus: launchInfo.overallstatus,
				total_testcases: launchInfo.total_testcases,
				passed_testcases: launchInfo.passed_testcases,
				failed_testcases: launchInfo.failed_testcases,
				skipped_testcases: launchInfo.skipped_testcases,
				end_time: launchInfo.end_time,
				duration: launchInfo.duration
			});
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateLaunch'));
	}
}
export async function deleteLaunch(launchId, tenantId) {
	try {
		const launch = await AutomationLaunch.findById(launchId).populate('sprint');

		if (launch.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const sprint = launch.sprint;

		if (dayjs(sprint.end_date).isBefore(dayjs())) return Promise.reject(generateBadRequestResponse(new Error(), 'Not allowed to delete old sprints data'));

		await AutomationLaunch.findOneAndDelete({ _id: launchId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteLaunch'));
	}
}
