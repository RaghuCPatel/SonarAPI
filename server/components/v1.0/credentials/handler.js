import { getTenantCredentials, regenerateTenantCredentials } from '../../../services/tenant';

export async function getAPIKeyForTenant(tenantId) {
	const creds = await getTenantCredentials(tenantId);
	return Promise.resolve(creds);
}

export async function refreshTenantAPIKey(tenantId) {
	const creds = await regenerateTenantCredentials(tenantId);
	return Promise.resolve(creds);
}
