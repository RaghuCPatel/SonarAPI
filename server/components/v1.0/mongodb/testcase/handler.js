import { createTestRecord, getTestRecords } from '../../../../services/testcase';
import { generateInternalServerErrorRepsonse } from '../../../../utils/errorHandler';

export async function _createTestRecord(testRecord, tenantId) {
	try {
		await createTestRecord(testRecord, tenantId);
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, '_createTestRecord'));
	}
}
export async function _getTestRecords(launchId, key, status, pageSize, pageNumber, tenantId) {
	try {
		const result = await getTestRecords(launchId, key, status, pageSize, pageNumber, tenantId);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, '_getTestRecords'));
	}
}
