import { createAPIMatrix, deleteAPIMatrix, getAPIMatrix, updateAPIMatrix } from '../../../../services/apimatrix';

export async function _createAPIMatrix(matrixInfo, tenantId) {
	await createAPIMatrix(matrixInfo, tenantId);
	return Promise.resolve();
}
export async function _getAPIMatrix(projectId, sprintId, tenantId, key, pageSize, pageNumber) {
	const result = await getAPIMatrix(projectId, sprintId, tenantId, key, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _updateAPIMatrix(matrixInfo, tenantId) {
	const result = await updateAPIMatrix(matrixInfo, tenantId);
	return Promise.resolve(result);
}
export async function _deleteAPIMatrix(matrixId, tenantId) {
	const result = await deleteAPIMatrix(matrixId, tenantId);
	return Promise.resolve(result);
}
