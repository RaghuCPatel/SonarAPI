import ProjectGroup from '../../models/project_group';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import { projectGroupSchema } from '../../models/schema/project_group';

export async function createGroup(groupInfo, tenantId) {
	try {
		const _res = projectGroupSchema.validate(groupInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const result = await ProjectGroup.query().select('id').insert({
			display_name: groupInfo.display_name,
			tenant_id: tenantId,
			project_id: groupInfo.project_id
		});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createGroup'));
	}
}
export async function getAllGroups() {
	try {
		const result = await ProjectGroup.query();
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getAllGroups'));
	}
}
export async function updateGroup(groupId, updateInfo) {
	try {
		if (!groupId) return Promise.reject(generateBadRequestResponse(new Error(), 'group not found'));

		await ProjectGroup.query()
			.findById(groupId)
			.patch(updateInfo);
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateGroup'));
	}
}
export async function deleteGroup(groupId) {
	try {
		if (!groupId) return Promise.reject(generateBadRequestResponse(new Error(), 'group not found'));

		await ProjectGroup.query().deleteById(groupId);
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'deleteGroup'));
	}
}
