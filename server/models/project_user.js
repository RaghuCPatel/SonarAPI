import { Model } from '../setup/db';
import TenantProject from './tenant_project';
import User from './user';
import UserRole from './user_role';

export default class ProjectUser extends Model {
	static get tableName() {
		return 'project_users';
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				filter: query => query.select('id', 'first_name', 'last_name', 'email', 'phone_number', 'is_active', 'created_at'),
				join: {
					from: 'project_users.user_id',
					to: 'users.id'
				}
			},
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: TenantProject,
				filter: query => query.select('id', 'tenant_id', 'display_name', 'is_active', 'created_at'),
				join: {
					from: 'project_users.project_id',
					to: 'tenant_projects.id'
				}
			},
			user_role: {
				relation: Model.BelongsToOneRelation,
				modelClass: UserRole,
				filter: query => query.select('id', 'role_id', 'created_at'),
				join: {
					from: 'project_users.user_id',
					to: 'users_roles.user_id'
				}
			}
		};
	}
}
