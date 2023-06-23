import { getTenant, updateLogoUrl, updateTenant } from '../../../services/tenant';

export async function _updateLogoUrl(tenantId, logo) {
	const result = await updateLogoUrl(tenantId, logo);
	return Promise.resolve(result);
}
export async function _updateTenant(tenantId, tenantInfo) {
	const result = await updateTenant(tenantId, tenantInfo);
	return Promise.resolve(result);
}
export async function _getTenant(tenantId) {
	const result = await getTenant(tenantId);
	return Promise.resolve(result);
}
