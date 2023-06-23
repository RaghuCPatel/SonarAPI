import { DEFAULT_PAGE_SIZE } from '../../config';
import ProjectUser from '../../models/project_user';
import Role from '../../models/role';
import { updateUserProfileSchema, updateUserSchema, userSchema } from '../../models/schema/user';
import TenantProject from '../../models/tenant_project';
import TenantUser from '../../models/tenant_user';
import User from '../../models/user';
import UserRole from '../../models/user_role';
import { knex } from '../../setup/db';
import cache from '../../setup/redis';
import { generateBadRequestResponse, generateInternalServerErrorRepsonse } from '../../utils/errorHandler';
import { ROLES } from '../constants';

export async function createUser(userInfo, tenantId) {
	try {
		const _res = userSchema.validate(userInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));
		const existingUser = await User.query().findOne({
			email: userInfo.email
		});
		if (existingUser) {
			return Promise.reject(generateBadRequestResponse(new Error(), 'user already exists'));
		}
		const role = await Role.query().findOne({ id: userInfo.role_id });
		if (!role) return Promise.reject(generateBadRequestResponse(new Error(), 'Incorrect roleId'));

		if (role.id === ROLES.SUPER_ADMIN) return Promise.reject(generateBadRequestResponse(new Error(), 'Not allowed to create Super Admin'));

		let user = null;
		await knex.transaction(async(t) => {
			user = await User.query(t).insertAndFetch({
				first_name: userInfo.first_name,
				last_name: userInfo.last_name,
				email: userInfo.email,
				phone_number: userInfo.phone_number,
				encrypted_password: userInfo.password,
				is_active: userInfo.is_active
			});
			await UserRole.query(t).insert({
				user_id: user.id,
				role_id: userInfo.role_id
			});
			await TenantUser.query(t).insert({
				user_id: user.id,
				tenant_id: tenantId
			});
		});
		return Promise.resolve(user);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'createUser'));
	}
}
export async function updateUser(userId, userInfo, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: userId });

		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const _res = updateUserSchema.validate(userInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const result = await User.query().patchAndFetchById(userId, {
			first_name: userInfo.first_name,
			last_name: userInfo.last_name,
			phone_number: userInfo.phone_number
		});

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(new Error(), 'updateUser'));
	}
}

export async function deactivateUser(id, tenantId) {
	try {
		const userRole = await UserRole.query().findOne({ user_id: id });

		if (userRole.role_id === ROLES.TENANT_ADMIN) return Promise.reject(generateBadRequestResponse(new Error(), 'Not allowed to deactivate admin'));

		const tenantUser = await TenantUser.query().findOne({ user_id: id });

		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await User.query()
			.patch({ is_active: false })
			.where({ id: id });
		await cache.del('user!' + id + 'login!status');
		return Promise.resolve();
	} catch (error) {
		return Promise.resolve(generateInternalServerErrorRepsonse(error, 'deactivateUser'));
	}
}
export async function activateUser(id, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: id });

		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		await User.query()
			.patch({ is_active: true })
			.where({ id: id });
		return Promise.resolve();
	} catch (error) {
		return Promise.resolve(generateInternalServerErrorRepsonse(error, 'activateUser'));
	}
}

export async function getAllUsers(tenantId, status, role, key, pageNumber, pageSize) {
	try {
		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;
		let result = null;
		const qb = User.query()
			.withGraphJoined('roles')
			.withGraphJoined('tenant')
			.where('tenant.tenant_id', tenantId);
		if (key) {
			qb.where('first_name', 'ilike', `%${key}%`);
		}
		if (status) {
			qb.where('is_active', status);
		}
		if (role) {
			qb.withGraphJoined('roles');
			qb.where('roles.role_id', '=', role);
		}
		result = await qb.orderBy('created_at', 'DESC').page(pageNumber, pageSize);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.resolve(generateInternalServerErrorRepsonse(error, 'getAllUsers'));
	}
}
export async function assignProject(assignmentData, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: assignmentData.testerId });
		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));
		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const project = await TenantProject.query().findOne({ id: assignmentData.projectId });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));
		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const _res = await ProjectUser.query()
			.findOne({
				project_id: assignmentData.projectId,
				user_id: assignmentData.testerId
			});
		if (_res) return Promise.reject(generateBadRequestResponse(new Error(), 'already assigned'));

		const result = await ProjectUser.query()
			.insert({
				user_id: assignmentData.testerId,
				project_id: assignmentData.projectId
			});
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'assignProject'));
	}
}
export async function removeProject(projectId, userId, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: userId });
		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));
		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const project = await TenantProject.query().findOne({ id: projectId });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));
		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const result = await ProjectUser.query()
			.where({
				user_id: userId,
				project_id: projectId
			})
			.delete();
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'removeProject'));
	}
}
export async function getProjectAssignments(userId, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: userId });
		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'user not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const result = await ProjectUser.query()
			.where({ user_id: userId })
			.withGraphJoined('project')
			.where('project.tenant_id', tenantId)
			.orderBy('created_at', 'DESC');
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getProjectAssignments'));
	}
}

export async function getUnassignedProjects(userId, tenantId) {
	try {
		const tenantUser = await TenantUser.query().findOne({ user_id: userId });
		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'user not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));
		const _result = await ProjectUser.query()
			.where({ user_id: userId })
			.withGraphFetched('project');
		const projectIds = [];
		_result.forEach(project => {
			projectIds.push(project.project_id);
		});
		const result = await TenantProject.query()
			.whereNotIn('id', projectIds)
			.where({ tenant_id: tenantId })
			.orderBy('created_at', 'DESC');

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getUnassignedProjects'));
	}
}

export async function getUsersRelatedToAProject(projectId, pageSize, pageNumber, tenantId) {
	try {
		const project = await TenantProject.query().findOne({ id: projectId });
		if (!project) return Promise.reject(generateBadRequestResponse(new Error(), 'Project not found'));
		if (project.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		if (!pageSize) pageSize = DEFAULT_PAGE_SIZE;
		if (!pageNumber) pageNumber = 0;
		let result = null;
		const qb = ProjectUser.query()
			.where({ project_id: projectId })
			.withGraphFetched('user')
			.withGraphFetched('user_role');
		result = await qb.orderBy('created_at', 'DESC').page(pageNumber, pageSize);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getUsersRelatedToAProject'));
	}
}
export async function getRoles() {
	try {
		const roles = await Role.query()
			.whereNot({ id: ROLES.SUPER_ADMIN });
		return Promise.resolve(roles);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'getUsersRelatedToAProject'));
	}
}
export async function updateProfile(userId, userInfo, tenantId) {
	try {
		const _res = updateUserProfileSchema.validate(userInfo);
		if (_res.error) return Promise.reject(generateBadRequestResponse(new Error(), _res.error.message));

		const tenantUser = await TenantUser.query().findOne({ user_id: userId });

		if (!tenantUser) return Promise.reject(generateBadRequestResponse(new Error(), 'User not found'));

		if (tenantUser.tenant_id !== tenantId) return Promise.reject(generateBadRequestResponse(new Error(), 'No access'));

		const result = await User.query().findById(userId).patchAndFetchById(userId, userInfo);

		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(await generateInternalServerErrorRepsonse(error, 'updateProfile'));
	}
}
