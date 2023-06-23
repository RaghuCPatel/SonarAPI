import { Model } from '../setup/db';
import Permission from './permissions';
import Role from './role';

export default class MasterRolePermission extends Model {
	static get tableName() {
		return 'master_roles_permissions';
	}

	static get relationMappings() {
		return {
			permission: {
				relation: Model.BelongsToOneRelation,
				modelClass: Permission,
				filter: query => query.select('id', 'name'),
				join: {
					from: 'master_roles_permissions.permission_id',
					to: 'permissions.id'
				}
			},
			role: {
				relation: Model.BelongsToOneRelation,
				modelClass: Role,
				filter: query => query.select('id', 'name'),
				join: {
					from: 'master_roles_permissions.role_id',
					to: 'roles.id'
				}
			}
		};
	}
}
