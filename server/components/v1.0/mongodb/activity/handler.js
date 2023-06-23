import { createActivity, deleteActivity, getActivities, updateActivity } from '../../../../services/activity';

export async function _createActivity(activityInfo, tenantId) {
	const result = await createActivity(activityInfo, tenantId);
	return Promise.resolve(result);
}
export async function _updateActivity(activityId, activityInfo, tenantId) {
	const result = await updateActivity(activityId, activityInfo, tenantId);
	return Promise.resolve(result);
}
export async function _getActivities(buildId, tenantId, key, pageSize, pageNumber) {
	const result = await getActivities(buildId, tenantId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _deleteActivity(buildId, tenantId) {
	const result = await deleteActivity(buildId, tenantId);
	return Promise.resolve(result);
}
