import { addLinkToProject, createProject, deleteLinkFromProject, deleteProject, getAllProjects, getProject } from '../../../services/tenantproject';

export async function createTenantProject(projectInfo, tenantId, userId, roleId) {
	const result = await createProject(projectInfo, tenantId, userId, roleId);
	return Promise.resolve(result);
}
export async function getTenantProjects(tenantId, userId, key, pageSize, pageNumber) {
	const result = await getAllProjects(tenantId, userId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _addLinkToProject(projectId, updateInfo, tenantId) {
	const result = await addLinkToProject(projectId, updateInfo, tenantId);
	return Promise.resolve(result);
}
export async function _deleteLinkFromProject(projectId, linkId, tenantId) {
	const result = await deleteLinkFromProject(projectId, linkId, tenantId);
	return Promise.resolve(result);
}
export async function deleteTenantProject(projectId, tenantId) {
	await deleteProject(projectId, tenantId);
	return Promise.resolve();
}
export async function getTenantProject(projectId, tenantId) {
	const result = await getProject(projectId, tenantId);
	return Promise.resolve(result);
}
