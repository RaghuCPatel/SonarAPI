import { addSprintReport, createSprint, deleteSprint, getSprints, updateSprint } from '../../../../services/sprints';

export async function _createSprint(sprintInfo, tenantId, userId) {
	const result = await createSprint(sprintInfo, tenantId, userId);
	return Promise.resolve(result);
}
export async function _updateSprint(sprintId, sprintInfo, tenantId, userId) {
	const result = await updateSprint(sprintId, sprintInfo, tenantId, userId);
	return Promise.resolve(result);
}
export async function _getSprints(projectId, tenantId, pageSize, pageNumber, all) {
	const result = await getSprints(projectId, tenantId, pageSize, pageNumber, all);
	return Promise.resolve(result);
}
export async function _addSprintReport(sprintId, report, userId, tenantId) {
	const result = await addSprintReport(sprintId, report, userId, tenantId);
	return Promise.resolve(result);
}
export async function _deleteSprint(sprintId, tenantId) {
	const result = await deleteSprint(sprintId, tenantId);
	return Promise.resolve(result);
}
