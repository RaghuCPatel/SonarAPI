import MasterRolePermission from '../../models/master_role_permission';
import Permission from '../../models/permissions';
import { generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
export async function getpermissions() {
	try {
		const result = await Permission.query();
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getpermissions'));
	}
}
export async function getCapabilties(roles) {
	try {
		const roleIds = [];
		roles.forEach(role => {
			roleIds.push(role.role_id);
		});

		const result = await MasterRolePermission.query()
			.whereIn('role_id', roleIds)
			.withGraphFetched('permission');
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getCapabilities'));
	}
}
