import { createActivityList, deleteActivityList, getActivityList, getAllActivityList, updateActivityList } from '../../../services/activity_list';

export async function _createActivityList(tenantId, activityListInfo) {
	const result = await createActivityList(tenantId, activityListInfo);
	return Promise.resolve(result);
}

export async function _getActivityList(tenantId, key, pageSize, pageNumber) {
	const result = await getActivityList(tenantId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}

export async function _getAllActivityList(tenantId) {
	const result = await getAllActivityList(tenantId);
	return Promise.resolve(result);
}

export async function _updateActivityList(tenantId, activityListId, activityListBody) {
	const result = await updateActivityList(tenantId, activityListId, activityListBody);
	return Promise.resolve(result);
}

export async function _deleteActivityList(tenantId, activityListId) {
	const result = await deleteActivityList(tenantId, activityListId);
	return Promise.resolve(result);
}
