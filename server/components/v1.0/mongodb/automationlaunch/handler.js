import { createLaunch, deleteLaunch, getLaunches, updateLaunch } from '../../../../services/automationlaunch';

export async function createProjectLaunch(launch, tenantId) {
	const launchId = await createLaunch(launch, tenantId);
	return Promise.resolve(launchId);
}
export async function getProjectLaunches(runId, key, startDate, source, pageSize, pageNumber, tenantId) {
	const result = await getLaunches(runId, key, startDate, source, pageSize, pageNumber, tenantId);
	return Promise.resolve(result);
}
export async function _updateLaunch(launchId, launchInfo, tenantId) {
	await updateLaunch(launchId, launchInfo, tenantId);
	return Promise.resolve();
}
export async function _deleteLaunch(launchId, tenantId) {
	await deleteLaunch(launchId, tenantId);
	return Promise.resolve();
}
