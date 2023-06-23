import { createRun, deleteRun, getRuns } from '../../../../services/projectRun';

export async function _createRun(runInfo, tenantId) {
	await createRun(runInfo, tenantId);
	return Promise.resolve();
}
export async function _getRuns(buildId, tenantId, key, pageSize, pageNumber) {
	const result = await getRuns(buildId, tenantId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _deleteRun(runId, tenantId) {
	await deleteRun(runId, tenantId);
	return Promise.resolve();
}
