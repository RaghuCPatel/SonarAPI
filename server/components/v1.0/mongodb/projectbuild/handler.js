import { addBuildReport, createBuild, deleteBuild, getAllBuilds, getBuildExecTime, getBuilds, updateBuild } from '../../../../services/projectbuild';

export async function _createBuild(buildInfo, tenantId) {
	await createBuild(buildInfo, tenantId);
	return Promise.resolve();
}
export async function _getBuilds(projectId, sprintId, tenantId, key, pageSize, pageNumber) {
	const result = await getBuilds(projectId, sprintId, tenantId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getAllBuilds(projectId, sprintId, tenantId) {
	const result = await getAllBuilds(projectId, sprintId, tenantId);
	return Promise.resolve(result);
}
export async function _deleteBuild(buildId, tenantId) {
	await deleteBuild(buildId, tenantId);
	return Promise.resolve();
}
export async function _addBuildReport(buildId, report, userId, tenantId) {
	await addBuildReport(buildId, report, userId, tenantId);
	return Promise.resolve();
}
export async function _updateBuild(buildId, buildInfo, tenantId) {
	await updateBuild(buildId, buildInfo, tenantId);
	return Promise.resolve();
}
export async function _getBuildExecTime(projectId, sprintId, tenantId) {
	const result = await getBuildExecTime(projectId, sprintId, tenantId);
	return Promise.resolve(result);
}
