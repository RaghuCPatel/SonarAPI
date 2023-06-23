import { get } from '../../../dao/settings_dao';
import TenantUser from '../../../models/tenant_user';

export async function acceptLatestTerm(userId) {
	try {
		const versionNumber = await get('TERM!VERSION');
		await TenantUser.query()
			.patch({ accepted_version: versionNumber })
			.where('user_id', userId);
		return Promise.resolve({
			status: 'success',
			data: { version_number: versionNumber }
		});
	} catch (error) {
		return Promise.reject({
			status: 'error',
			data: error
		});
	}
}
