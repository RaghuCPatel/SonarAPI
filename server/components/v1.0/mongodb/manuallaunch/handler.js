import { createManualLaunch, deleteManualLaunch, getManualLaunches, updateManualLaunch } from '../../../../services/manuallaunch';

export async function _createManualLaunch(launchInfo, tenantId) {
	await createManualLaunch(launchInfo, tenantId);
	return Promise.resolve();
}
export async function _getManualLaunches(runId, tenantId, key, execDate, pageSize, pageNumber) {
	const result = await getManualLaunches(runId, tenantId, key, execDate, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _updateManualLaunch(launchInfo, launchId, tenantId) {
	await updateManualLaunch(launchInfo, launchId, tenantId);
	return Promise.resolve();
}
export async function _deleteManualLaunch(launchId, tenantId) {
	await deleteManualLaunch(launchId, tenantId);
	return Promise.resolve();
}
