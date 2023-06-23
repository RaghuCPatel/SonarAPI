import { createDefect, deleteDefect, getDefects, updateDefect } from '../../../../services/defect';

export async function _createDefect(defectInfo, tenantId) {
	const result = await createDefect(defectInfo, tenantId);
	return Promise.resolve(result);
}
export async function _getDefects(projectId, sprintId, tenantId, key, build, pageSize, pageNumber) {
	const result = await getDefects(projectId, sprintId, tenantId, key, build, pageSize, pageNumber);
	return Promise.resolve(result);
}
export async function _updateDefect(defectId, tenantId, defectInfo) {
	await updateDefect(defectId, tenantId, defectInfo);
	return Promise.resolve();
}
export async function _deleteDefect(defectId, tenantId) {
	await deleteDefect(defectId, tenantId);
	return Promise.resolve();
}
