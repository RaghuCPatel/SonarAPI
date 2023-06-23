import { createTenant, _verifyDomain } from '../../../services/tenant';

export async function registerNewTenant(tenantInfo) {
	const tenant = await createTenant(tenantInfo);
	return Promise.resolve(tenant);
}

export async function verifyDomain(domainName) {
	const result = await _verifyDomain(domainName);
	return Promise.resolve(result);
}
