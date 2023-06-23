import { DEFAULT_PAGE_SIZE, DEFAULT_RUN_NAME } from '../../config';
import { Activity } from '../../models/mongoose/activity';
import { ProjectRun } from '../../models/mongoose/run';
import { projectRunSchema } from '../../models/schema/run';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createRun(runInfo, tenantId) {
	try {
		const _res = await projectRunSchema.validate(runInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findById(runInfo.project_id);
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const activity = await Activity.findById(runInfo.activity_id).populate('sprint');
		if (!activity) return Promise.reject(new Error(), 'Specified activity not found');

		let runName = null;
		const run = await ProjectRun.find({ activity: runInfo.activity_id }).sort({ createdAt: 'desc' }).limit(1);
		if (run.length === 0) runName = DEFAULT_RUN_NAME.FIRST_RUN_NAME;
		else {
			const prevRunName = run[0].run_name;
			const id = Number(prevRunName.slice(4));
			runName = DEFAULT_RUN_NAME.PREFIX + (id + 1);
		}
		const result = await ProjectRun.create({
			run_name: runName,
			project_id: runInfo.project_id,
			project_code: project.display_id,
			tenant_id: tenantId,
			sprint: activity.sprint,
			build: activity.build,
			activity: runInfo.activity_id
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'createRun'));
	}
}
export async function getRuns(activityId, tenantId, key, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { activity: activityId, tenant_id: tenantId };

		const qb = ProjectRun.find(query);

		if (key) {
			query.run_name = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ run_name: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}

		const runs = await qb.sort({ createdAt: 'desc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await ProjectRun.countDocuments(query);
		const result = {
			runs: runs,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'getRuns'));
	}
}
export async function deleteRun(runId, tenantId) {
	try {
		const run = await ProjectRun.findById(runId).populate('sprint');

		if (!run) return Promise.reject(generateBadRequestResponse(new Error(), 'Run not found'));

		if (run.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await ProjectRun.findOneAndDelete({ _id: runId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'deleteRun'));
	}
}
