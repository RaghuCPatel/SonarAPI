import { DEFAULT_ACTIVITY_NAME_PREFIX, DEFAULT_PAGE_SIZE } from '../../config';
import { Activity } from '../../models/mongoose/activity';
import { ProjectBuild } from '../../models/mongoose/build';
import { activityJoiSchema, activityJoiSchemaUpdate } from '../../models/schema/activity';
import TenantProject from '../../models/tenant_project';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createActivity(activityInfo, tenantId) {
	try {
		const _res = activityJoiSchema.validate(activityInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const project = await TenantProject.query().findOne({ id: activityInfo.project_id });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));

		const build = await ProjectBuild.findById(activityInfo.build_id).populate('sprint');
		if (!build) return Promise.reject(new Error(), 'Specified build not found');

		const sprint = build.sprint;

		const activity = await Activity.findOne({ display_name: activityInfo.display_name, project_id: activityInfo.project_id, build: activityInfo.build_id });
		if (activity) return Promise.reject(generateBadRequestResponse(new Error(), 'Activity already exists'));

		const activities = await Activity.find({ build: activityInfo.build_id }).sort({ createdAt: 'desc' });

		let displayId = null;
		if (activities.length === 0) {
			displayId = DEFAULT_ACTIVITY_NAME_PREFIX + '1';
		} else {
			let prevActivityID = activities[0].display_id;
			prevActivityID = Number(prevActivityID.slice(3));
			displayId = DEFAULT_ACTIVITY_NAME_PREFIX + (prevActivityID + 1);
		}

		const result = await Activity.create({
			display_name: activityInfo.display_name,
			display_id: displayId,
			estimated_time: activityInfo.estimated_time,
			build: activityInfo.build_id,
			sprint: sprint.id,
			project_id: project.id,
			project_code: project.display_id,
			tenant_id: tenantId
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createActivity'));
	}
}

export async function updateActivity(activityId, activityInfo, tenantId) {
	try {
		const _res = activityJoiSchemaUpdate.validate(activityInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const activity = await Activity.findById(activityId).populate('sprint');

		if (!activity) return Promise.reject(generateBadRequestResponse(new Error(), 'Activity not found'));

		if (activity.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		if (activity.display_name !== activityInfo.display_name) {
			const _activity = await Activity.countDocuments({ display_name: activityInfo.display_name, project_id: activityInfo.project_id, tenant_id: tenantId, build: activity.build });
			if (_activity > 0) return Promise.reject(generateBadRequestResponse(new Error(), 'An activity with this name already exists'));
		}

		const result = await Activity.findByIdAndUpdate(activityId, activityInfo);

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'updateActivity'));
	}
}
export async function getActivities(buildId, tenantId, key, pageSize, pageNumber) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;

		const query = { build: buildId, tenant_id: tenantId };
		const qb = Activity.find(query);

		if (key) {
			query.display_name = { $regex: new RegExp(`.*${key}.*`, 'gi') };
			qb.find({ launch_name: { $regex: new RegExp(`.*${key}.*`, 'gi') } });
		}

		const activities = await qb
			.sort({ createdAt: 'desc' })
			.limit(pageSize)
			.skip(pageNumber * pageSize);

		const count = await Activity.countDocuments(query);

		const result = {
			activities: activities,
			total: count
		};
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getActivities'));
	}
}
export async function deleteActivity(activityId, tenantId) {
	try {
		const activity = await Activity.findById(activityId).populate('sprint');

		if (!activity) return Promise.reject(generateBadRequestResponse(new Error(), 'activity not found'));

		if (activity.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await Activity.findOneAndDelete({ _id: activityId });

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteActivity'));
	}
}
