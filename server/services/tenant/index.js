import Tenant from '../../models/tenant';
import TenantUser from '../../models/tenant_user';
import User from '../../models/user';
import UserRole from '../../models/user_role';
import { ROLES } from '../../services/constants';
import { knex } from '../../setup/db';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import path from 'path';
import { tenantSchema } from '../../models/schema/tenant';
import MasterRolePermission from '../../models/master_role_permission';
import RolePermission from '../../models/roles_permissions';

export async function regenerateTenantCredentials(tenantId) {
	const result = await Tenant.query()
		.patchAndFetchById(tenantId, { api_key: uuidv4() });
	return Promise.resolve(result.api_key);
}
export async function getTenantCredentials(tenantId) {
	const creds = await Tenant.query().findById(tenantId);
	return Promise.resolve(creds.api_key);
}
export async function createTenant(tenantInfo) {
	let tenant = {};
	let rolePermissions = [];
	const _res = tenantSchema.validate(tenantInfo);
	if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

	const domain = tenantInfo.domain.toLowerCase();

	await knex.transaction(async(txn) => {
		// Check if the email already exists
		const existingUser = await User.query().findOne({
			email: tenantInfo.email
		});
		if (existingUser) return Promise.reject(generateBadRequestResponse(new Error(), 'Email already exists'));

		const existingTenant = await Tenant.query().findOne({ domain: domain });

		if (existingTenant) return Promise.reject(generateBadRequestResponse(new Error(), 'Domain name already exists'));
		// 1. First create the tenant
		tenant = await Tenant.query(txn).insert({
			domain: domain,
			title: tenantInfo.title
		});
		// 2. Create the user
		const user = await User.query(txn).insert({
			first_name: tenantInfo.first_name,
			last_name: tenantInfo.last_name,
			email: tenantInfo.email,
			phone_number: tenantInfo.phone_number,
			encrypted_password: tenantInfo.password
		});
		// 3. Add the user to the tenant
		await TenantUser.query(txn).insert({
			user_id: user.id,
			tenant_id: tenant.id
		});
		// 4. Give the user admin role
		await UserRole.query(txn).insert({
			user_id: user.id,
			role_id: ROLES.TENANT_ADMIN
		});
		// 5. Set Role permissions
		rolePermissions = await MasterRolePermission.query().select('role_id', 'permission_id');
		rolePermissions.forEach(rolePermission => {
			rolePermission.tenant_id = tenant.id;
		});
		await RolePermission.query(txn).insert(rolePermissions);
	});

	return Promise.resolve(tenant);
}
export async function _verifyDomain(domainName) {
	try {
		const tenant = await Tenant.query().findOne({ domain: domainName });
		if (!tenant) return Promise.reject(generateBadRequestResponse(new Error(), 'Domain does not exist'));
		return Promise.resolve();
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'verifyDomain'));
	}
}
export async function updateLogoUrl(tenantId, logo) {
	try {
		const tenant = await Tenant.query().findById(tenantId);
		if (!tenant) return Promise.reject(generateBadRequestResponse(new Error(), 'Tenant not found'));

		let logoUrlToDelete = tenant.logo_url;
		if (logoUrlToDelete) {
			logoUrlToDelete = logoUrlToDelete.split('/');
			const fileToDelete = path.join('uploads/', logoUrlToDelete[3]);
			fs.unlink(fileToDelete, err => {
				if (err) console.log(err);
			});
		}

		const logoUrl = process.env.LOGO_BASE_URL + logo.filename;
		const result = await Tenant.query()
			.patchAndFetchById(tenantId, { logo_url: logoUrl });

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'updateLogoUrl'));
	}
}
export async function updateTenant(tenantId, tenantInfo) {
	try {
		const tenant = await Tenant.query().findById(tenantId);
		if (!tenant) return Promise.reject(generateBadRequestResponse(new Error(), 'Tenant not found'));

		const result = await Tenant.query()
			.patchAndFetchById(tenantId, { title: tenantInfo.title });

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'updateLogoUrl'));
	}
}
export async function getTenant(tenantId) {
	try {
		const tenant = await Tenant.query().findById(tenantId);
		if (!tenant) return Promise.reject(generateBadRequestResponse(new Error(), 'Tenant not found'));
		return Promise.resolve(tenant);
	} catch (error) {
		return Promise.reject(generateInternalServerErrorRepsonse(error, 'getTenant'));
	}
}
