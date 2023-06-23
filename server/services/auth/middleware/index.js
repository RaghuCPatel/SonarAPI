import jwt from 'jsonwebtoken';
import Permission from '../../../models/permissions';
import RolePermission from '../../../models/roles_permissions';
import Tenant from '../../../models/tenant';
import TenantUser from '../../../models/tenant_user';
import { ROLES } from '../../constants';
export function checkIfDomainExist(request, response, next) {
	try {
		if (!request.query.domain) {
			return next({ status: 400, message: 'domain not specified.' });
		} else {
			next();
		}
	} catch (e) {
		console.error(e.message);
		next(e);
	}
}

export async function checkTokenForTenantAPI(request, response, next) {
	const apiKey = request.headers['testviz-access-token'];
	const tenantFromRequest = await Tenant.query().findById(request.params.id);
	if (apiKey === tenantFromRequest.api_key) {
		return next();
	}
	response.status(401).json({ Error: 'Wrong Token' });
}
export function isUserSuperAdmin(request, response, next) {
	if (request.roles[0].role_id === ROLES.SUPER_ADMIN) { return next(); }
	response.status(403).json({ Error: 'Only Admin role is allowed' });
}

export function checkAccessPermissions(perm) {
	return async(request, response, next) => {
		const permissions = await Permission.query()
			.whereIn('name', perm);

		if (permissions.length === 0) response.status(500).json({ Error: 'Permission Not Set' });

		const roles = request.roles;
		const roleIds = [];
		roles.forEach(role => {
			roleIds.push(role.role_id);
		});

		request.permissions = [];
		let rolePerm = null;
		rolePerm = await RolePermission.query()
			.whereIn('role_id', roleIds)
			.withGraphJoined('[permission, tenant]')
			.whereIn('permission.name', perm)
			.where('tenant.id', request.tenant.tenant_id);

		if (rolePerm.length !== 0) {
			request.permissions = rolePerm;
			return next();
		}
		response.status(403).json({ Error: 'Not allowed' });
	};
}
export function checkForRootToken(request, response, next) {
	const token = request.headers['x-access-token'] || request.headers.authorization;
	if (token === ('Bearer ' + process.env.ROOT_TOKEN)) {
		return next();
	}
	response.status(401).json({ Error: 'Wrong Token' });
}
export async function resolveTenant(request, response, next) {
	const bearerToken = request.headers.authorization;
	const token = bearerToken.split(' ');
	const decodedToken = jwt.decode(token[1]);
	const tenantUser = await TenantUser.query().findOne({ user_id: request.userId });

	if (!decodedToken.tenant) {
		response.status(401).json({ Error: 'No access' });
	} else if (decodedToken.tenant.id === tenantUser.tenant_id) {
		next();
	} else {
		response.status(401).json({ Error: 'No access' });
	}
}
