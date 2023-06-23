import { activateUser, assignProject, createUser, deactivateUser, getAllUsers, getProjectAssignments, getRoles, getUnassignedProjects, getUsersRelatedToAProject, removeProject, updateProfile, updateUser } from '../../../services/tester';

export async function _createUser(userInfo, tenantId) {
	const result = await createUser(userInfo, tenantId);
	return Promise.resolve(result);
}

export async function _updateUser(userId, userInfo, tenantId) {
	await updateUser(userId, userInfo, tenantId);
	return Promise.resolve();
}
export async function _deactivateUser(id, tenantId) {
	await deactivateUser(id, tenantId);
	return Promise.resolve();
}
export async function _activateUser(id, tenantId) {
	await activateUser(id, tenantId);
	return Promise.resolve();
}
export async function _getAllUsers(tenantId, status, role, key, pageNumber, pageSize) {
	const result = await getAllUsers(tenantId, status, role, key, pageNumber, pageSize);
	return Promise.resolve(result);
}
export async function _assignProject(assignmentData, tenantId) {
	const result = await assignProject(assignmentData, tenantId);
	return Promise.resolve(result);
}
export async function _removeProject(projectId, testerId, tenantId) {
	const result = await removeProject(projectId, testerId, tenantId);
	return Promise.resolve(result);
}
export async function _getProjectAssignments(testerId, tenantId) {
	const result = await getProjectAssignments(testerId, tenantId);
	return Promise.resolve(result);
}
export async function _getUnassignedProjects(testerId, tenantId) {
	const result = await getUnassignedProjects(testerId, tenantId);
	return Promise.resolve(result);
}
export async function _getUsersRelatedToAProject(projectId, pageSize, pageNumber, tenantId) {
	const result = await getUsersRelatedToAProject(projectId, pageSize, pageNumber, tenantId);
	return Promise.resolve(result);
}
export async function _getRoles() {
	const result = await getRoles();
	return Promise.resolve(result);
}
export async function _updateProfile(userId, userInfo, tenantId) {
	const result = await updateProfile(userId, userInfo, tenantId);
	return Promise.resolve(result);
}
