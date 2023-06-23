import ProjectUser from './project_user';
import TenantUser from './tenant_user';
import UserRole from './user_role';

const Password = require('objection-password')({
	passwordField: 'encrypted_password'
});
const Model = require('objection').Model;

export default class User extends Password(Model) {
	static get tableName() {
		return 'users';
	}

	static get relationMappings() {
		return {
			tenant: {
				relation: Model.BelongsToOneRelation,
				modelClass: TenantUser,
				filter: query => query.select('id', 'tenant_id', 'user_id', 'created_at'),
				join: {
					from: 'tenant_users.user_id',
					to: 'users.id'
				}
			},
			roles: {
				relation: Model.HasManyRelation,
				modelClass: UserRole,
				filter: query => query.select('id', 'role_id', 'user_id', 'created_at'),
				join: {
					from: 'users_roles.user_id',
					to: 'users.id'
				}
			},
			project: {
				relation: Model.HasManyRelation,
				modelClass: ProjectUser,
				filter: query => query.select('id', 'project_id', 'user_id', 'created_at'),
				join: {
					from: 'project_users.user_id',
					to: 'users.id'
				}
			}
		};
	}
}
