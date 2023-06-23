import { createGroup, deleteGroup, getAllGroups, updateGroup } from '../../../services/projectgroup';

export async function createProjectGroup(groupInfo, tenantId) {
	const result = await createGroup(groupInfo, tenantId);
	return Promise.resolve(result);
}
export async function getProjectGroups() {
	const result = await getAllGroups();
	return Promise.resolve(result);
}
export async function updateProjectGroup(groupId, updateInfo) {
	await updateGroup(groupId, updateInfo);
	return Promise.resolve();
}
export async function deleteProjectGroup(groupId) {
	await deleteGroup(groupId);
	return Promise.resolve();
}
