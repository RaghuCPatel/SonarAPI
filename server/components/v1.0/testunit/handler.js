import { createTestcase, deleteTestcase, getAllTestcases } from '../../../services/testunit';

export async function createTestUnit(testUnitInfo, tenantId) {
	const result = await createTestcase(testUnitInfo, tenantId);
	return Promise.resolve(result);
}
export async function getTestUnits() {
	const result = await getAllTestcases();
	return Promise.resolve(result);
}
export async function deleteTestUnit(testunitId) {
	await deleteTestcase(testunitId);
	return Promise.resolve();
}
