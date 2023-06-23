import { Model } from '../setup/db';
import Permission from './permissions';
import Role from './role';
import Tenant from './tenant';

export default class RolePermission extends Model {
	static get tableName() {
		return 'roles_permissions';
	}

	static get relationMappings() {
		return {
			tenant: {
				relation: Model.BelongsToOneRelation,
				modelClass: Tenant,
				filter: query => query.select('id', 'domain', 'title', 'created_at'),
				join: {
					from: 'roles_permissions.tenant_id',
					to: 'tenants.id'
				}
			},
			permission: {
				relation: Model.BelongsToOneRelation,
				modelClass: Permission,
				filter: query => query.select('id', 'name'),
				join: {
					from: 'roles_permissions.permission_id',
					to: 'permissions.id'
				}
			},
			role: {
				relation: Model.BelongsToOneRelation,
				modelClass: Role,
				filter: query => query.select('id', 'name'),
				join: {
					from: 'roles_permissions.role_id',
					to: 'roles.id'
				}
			}
		};
	}
}
