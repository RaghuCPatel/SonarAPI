import { testUnitSchema } from '../../models/schema/test_unit';
import TestUnit from '../../models/test_unit';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';

export async function createTestcase(testUnitInfo, tenantId) {
	try {
		const _res = testUnitSchema.validate(testUnitInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));
		const result = await TestUnit.query().select('id').insert({
			display_name: testUnitInfo.display_name,
			tenant_id: tenantId,
			project_id: testUnitInfo.project_id,
			group_id: testUnitInfo.group_id,
			description: testUnitInfo.description
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createTestcase'));
	}
}
export async function getAllTestcases() {
	try {
		const result = await TestUnit.query();
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getAllTestcases'));
	}
}
export async function deleteTestcase(testunitId) {
	try {
		if (!testunitId) return Promise.reject(generateBadRequestResponse(new Error(), 'test case not found'));

		await TestUnit.query().deleteById(testunitId);
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteTestcase'));
	}
}
