import { getActivitiesData, getBuildsData, getDataFortiles, getDefectsData, getDefectsDataForEachBuild, getProjectDefetcsData, getProjectTestExecCoverage, getProjectTilesData, getTestExecCoverage, getTestExecCoverageForEachBuild, getVarianceActivitiesData } from '../../../services/analytics';

export async function _getTestExecCoverage(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	const result = await getTestExecCoverage(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getDataFortiles(userId, roleId, projectId, tenantId, buildId, startDate, endDate, pageSize, pageNumber) {
	const result = await getDataFortiles(userId, roleId, projectId, tenantId, buildId, startDate, endDate, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getDefectsData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	const result = await getDefectsData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getActivitiesData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber) {
	const result = await getActivitiesData(userId, roleId, projectId, tenantId, startDate, endDate, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getDefectsDataForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber) {
	const result = await getDefectsDataForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getTestExecCoverageForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber) {
	const result = await getTestExecCoverageForEachBuild(userId, roleId, projectId, tenantId, buildId, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _getProjectTestExecCoverage(userId, roleId, tenantId, projectIds) {
	const result = await getProjectTestExecCoverage(userId, roleId, tenantId, projectIds);
	return Promise.resolve(result);
}
export async function _getProjectDefetcsData(userId, roleId, tenantId, projectIds) {
	const result = await getProjectDefetcsData(userId, roleId, tenantId, projectIds);
	return Promise.resolve(result);
}
export async function _getProjectTilesData(userId, roleId, tenantId, projectIds) {
	const result = await getProjectTilesData(userId, roleId, tenantId, projectIds);
	return Promise.resolve(result);
}
export async function _getBuildsData(userId, roleId, tenantId, projectIds) {
	const result = await getBuildsData(userId, roleId, tenantId, projectIds);
	return Promise.resolve(result);
}
export async function _getVarianceActivitiesData(userId, roleId, tenantId, projectIds) {
	const result = await getVarianceActivitiesData(userId, roleId, tenantId, projectIds);
	return Promise.resolve(result);
}
