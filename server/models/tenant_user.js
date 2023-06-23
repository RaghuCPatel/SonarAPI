import { Model } from '../setup/db';
import Tenant from './tenant';
import User from './user';

export default class TenantUser extends Model {
	static get tableName() {
		return 'tenant_users';
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				filter: query => query.select('id', 'first_name', 'last_name', 'email', 'phone_number', 'is_active', 'created_at'),
				join: {
					from: 'tenant_users.user_id',
					to: 'users.id'
				}
			},
			tenant: {
				relation: Model.BelongsToOneRelation,
				modelClass: Tenant,
				filter: query => query.select('id', 'domain', 'name', 'created_at'),
				join: {
					from: 'tenant_users.tenant_id',
					to: 'tenants.id'
				}
			}
		};
	}
}
