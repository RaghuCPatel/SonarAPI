import dayjs from 'dayjs';
import { DEFAULT_MLAUNCH_NAME, DEFAULT_PAGE_SIZE } from '../../config';
import { ManualLaunch } from '../../models/mongoose/manual_launch';
import { ProjectRun } from '../../models/mongoose/run';
import TenantProject from '../../models/tenant_project';
import { manualLaunchSchema, updateManualLaunchSchema } from '../../models/schema/manual_launch';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createManualLaunch(launchInfo, tenantId) {
	try {
		const _res = await manualLaunchSchema.validate(launchInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const totalNewTestcases = launchInfo.new_testcases_added.p0 + launchInfo.new_testcases_added.p1 + launchInfo.new_testcases_added.p2 + launchInfo.new_testcases_added.p3 + launchInfo.new_testcases_added.p4;
		if (totalNewTestcases !== launchInfo.new_testcases_added.total_new_testcases) return Promise.reject(generateBadRequestResponse(new Error(), 'total new testcases is wrong'));

		const totalUpdatedTestcases = launchInfo.testcases_updated.p0 + launchInfo.testcases_updated.p1 + launchInfo.testcases_updated.p2 + launchInfo.testcases_updated.p3 + launchInfo.testcases_updated.p4;
		if (totalUpdatedTestcases !== launchInfo.testcases_updated.total_updated_testcases) return Promise.reject(generateBadRequestResponse(new Error(), 'total updated testcases is wrong'));

		const project = await TenantProject.query().findById(launchInfo.project_id);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const run = await ProjectRun.findById(launchInfo.run_id).populate('sprint');
		if (!run) return Promise.reject(generateBadRequestResponse(new Error(), 'Specified run not found'));

		const sprint = run.sprint;

		if (dayjs(launchInfo.execution_date).isAfter(dayjs(sprint.start_date)) && dayjs(launchInfo.execution_date).isAfter(dayjs(sprint.end_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Select the execution date within the sprint range'));
		} else if (dayjs(launchInfo.execution_date).isBefore(dayjs(sprint.start_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Select the execution date within the sprint range'));
		}

		let launchName = null;
		const launch = await ManualLaunch.find({ run: launchInfo.run_id }).sort({ createdAt: 'desc' }).limit(1);
		if (launch.length === 0) launchName = DEFAULT_MLAUNCH_NAME.FIRST_MLAUNCH_NAME;
		else {
			const prevLaunchName = launch[0].launch_name;
			const id = Number(prevLaunchName.slice(8));
			launchName = DEFAULT_MLAUNCH_NAME.PREFIX + (id + 1);
		}

		let overallstatus = null;

		if (launchInfo.metrics.planned_testcases === launchInfo.metrics.passed_testcases) {
			overallstatus = 'passed';
		} else if (launchInfo.metrics.planned_testcases === launchInfo.metrics.blocked_testcases) {
			overallstatus = 'not_executed';
		} else {
			overallstatus = 'failed';
		}

		await ManualLaunch.create({
			environment: launchInfo.environment,
			launch_name: launchName,
			sprint: run.sprint,
			build: launchInfo.build_id,
			run: launchInfo.run_id,
			activity: run.activity,
			project_id: launchInfo.project_id,
			project_code: launchInfo.project_code,
			tenant_id: tenantId,
			execution_date: launchInfo.execution_date,
			released: launchInfo.released,
			source: launchInfo.source,
			defect_finding_data: {
				total_defects: launchInfo.defect_finding_data.total_defects,
				blockers: launchInfo.defect_finding_data.blockers,
				critical_defects: launchInfo.defect_finding_data.critical_defects,
				major_defects: launchInfo.defect_finding_data.major_defects,
				minor_defects: launchInfo.defect_finding_data.minor_defects,
				rejected_defects: launchInfo.defect_finding_data.rejected_defects
			},

			defect_fix_data: {
				retested_defects: launchInfo.defect_fix_data.retested_defects,
				fixed_defects: launchInfo.defect_fix_data.fixed_defects
			},
			metrics: {
				planned_testcases: launchInfo.metrics.planned_testcases,
				executed_testcases: launchInfo.metrics.executed_testcases,
				passed_testcases: launchInfo.metrics.passed_testcases,
				failed_testcases: launchInfo.metrics.failed_testcases,
				blocked_testcases: launchInfo.metrics.blocked_testcases,
				execution_time: launchInfo.metrics.execution_time,
				overallstatus: overallstatus
			},
			new_testcases_added: {
				p0: launchInfo.new_testcases_added.p0,
				p1: launchInfo.new_testcases_added.p1,
				p2: launchInfo.new_testcases_added.p2,
				p3: launchInfo.new_testcases_added.p3,
				p4: launchInfo.new_testcases_added.p4,
				total_new_testcases: launchInfo.new_testcases_added.total_new_testcases
			},
			testcases_updated: {
				p0: launchInfo.testcases_updated.p0,
				p1: launchInfo.testcases_updated.p1,
				p2: launchInfo.testcases_updated.p2,
				p3: launchInfo.testcases_updated.p3,
				p4: launchInfo.testcases_updated.p4,
				total_updated_testcases: launchInfo.testcases_updated.total_updated_testcases
			},
			defect_rejected_data: {
				total_defects: launchInfo.defect_rejected_data.total_defects,
				blockers: launchInfo.defect_rejected_data.blockers,
				critical_defects: launchInfo.defect_rejected_data.critical_defects,
				major_defects: launchInfo.defect_rejected_data.major_defects,
				minor_defects: launchInfo.defect_rejected_data.minor_defects,
				rejected_defects: launchInfo.defect_rejected_data.rejected_defects
			}
		});
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createManualLaunch'));
	}
}
export async function updateManualLaunch(launchInfo, launchId, tenantId) {
	try {
		const _res = await updateManualLaunchSchema.validate(launchInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const totalNewTestcases = launchInfo.new_testcases_added.p0 + launchInfo.new_testcases_added.p1 + launchInfo.new_testcases_added.p2 + launchInfo.new_testcases_added.p3 + launchInfo.new_testcases_added.p4;
		if (totalNewTestcases !== launchInfo.new_testcases_added.total_new_testcases) return Promise.reject(generateBadRequestResponse(new Error(), 'total new testcases is wrong'));

		const totalUpdatedTestcases = launchInfo.testcases_updated.p0 + launchInfo.testcases_updated.p1 + launchInfo.testcases_updated.p2 + launchInfo.testcases_updated.p3 + launchInfo.testcases_updated.p4;
		if (totalUpdatedTestcases !== launchInfo.testcases_updated.total_updated_testcases) return Promise.reject(generateBadRequestResponse(new Error(), 'total updated testcases is wrong'));

		const launch = await ManualLaunch.findById(launchId).populate('sprint');

		if (!launch) return Promise.reject(generateBadRequestResponse(new Error(), 'Launch not found'));

		if (launch.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const sprint = launch.sprint;

		if (dayjs(launchInfo.execution_date).isAfter(dayjs(sprint.start_date)) && dayjs(launchInfo.execution_date).isAfter(dayjs(sprint.end_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Select the execution date within the sprint range'));
		} else if (dayjs(launchInfo.execution_date).isBefore(dayjs(sprint.start_date))) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'Select the execution date within the sprint range'));
		}

		let overallstatus = null;

		if (launchInfo.metrics.planned_testcases === launchInfo.metrics.passed_testcases) {
			overallstatus = 'passed';
		} else if (launchInfo.metrics.planned_testcases === launchInfo.metrics.blocked_testcases) {
			overallstatus = 'not_executed';
		} else {
			overallstatus = 'failed';
		}

		const result = await ManualLaunch.updateOne({ _id: launchId }, {
			execution_date: launchInfo.execution_date,
			released: launchInfo.released,
			source: launchInfo.source,
			defect_finding_data: {
				total_defects: launchInfo.defect_finding_data.total_defects,
				blockers: launchInfo.defect_finding_data.blockers,
				critical_defects: launchInfo.defect_finding_data.critical_defects,
				major_defects: launchInfo.defect_finding_data.major_defects,
				minor_defects: launchInfo.defect_finding_data.minor_defects,
				rejected_defects: launchInfo.defect_finding_data.rejected_defects
			},

			defect_fix_data: {
				retested_defects: launchInfo.defect_fix_data.retested_defects,
				fixed_defects: launchInfo.defect_fix_data.fixed_defects
			},
			metrics: {
				planned_testcases: launchInfo.metrics.planned_testcases,
				executed_testcases: launchInfo.metrics.executed_testcases,
				passed_testcases: launchInfo.metrics.passed_testcases,
				failed_testcases: launchInfo.metrics.failed_testcases,
				blocked_testcases: launchInfo.metrics.blocked_testcases,
				execution_time: launchInfo.metrics.execution_time,
				overallstatus: overallstatus
			},
			new_testcases_added: {
				p0: launchInfo.new_testcases_added.p0,
				p1: launchInfo.new_testcases_added.p1,
				p2: launchInfo.new_testcases_added.p2,
				p3: launchInfo.new_testcases_added.p3,
				p4: launchInfo.new_testcases_added.p4,
				total_new_testcases: launchInfo.new_testcases_added.total_new_testcases
			},
			testcases_updated: {
				p0: launchInfo.testcases_updated.p0,
				p1: launchInfo.testcases_updated.p1,
				p2: launchInfo.testcases_updated.p2,
				p3: launchInfo.testcases_updated.p3,
				p4: launchInfo.testcases_updated.p4,
				total_updated_testcases: launchInfo.testcases_updated.total_updated_testcases
			},
			defect_rejected_data: {
				total_defects: launchInfo.defect_rejected_data.total_defects,
				blockers: launchInfo.defect_rejected_data.blockers,
				critical_defects: launchInfo.defect_rejected_data.critical_defects,
				major_defects: launchInfo.defect_rejected_data.major_defects,
				minor_defects: launchInfo.defect_rejected_data.minor_defects,
				rejected_defects: launchInfo.defect_rejected_data.rejected_defects
			}

		});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateManualLaunch'));
	}
}
export async function getManualLaunches(runId, tenantId, key, execDate, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { run: runId, tenant_id: tenantId };
		const qb = ManualLaunch.find(query);

		if (key) {
			query.launch_name = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ launch_name: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}

		if (execDate) {
			query.start_time = { $gte: dayjs(execDate).startOf('day').format(), $lte: dayjs(execDate).endOf('day').format() };
			qb.find({ start_time: { $gte: dayjs(execDate).startOf('day').format(), $lte: dayjs(execDate).endOf('day').format() } });
		}

		const launches = await qb
			.sort({ createdAt: 'desc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await ManualLaunch.countDocuments(query);
		const result = {
			launches: launches,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getManualLaunches'));
	}
}
export async function deleteManualLaunch(launchId, tenantId) {
	try {
		const launch = await ManualLaunch.findById(launchId).populate('sprint');

		if (!launch) return Promise.reject(generateBadRequestResponse(new Error(), 'Launch not found'));

		if (launch.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await ManualLaunch.findOneAndDelete({ _id: launchId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteManualLaunch'));
	}
}
