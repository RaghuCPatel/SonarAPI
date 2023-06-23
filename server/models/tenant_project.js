import { Model } from '../setup/db';
import ProjectUser from './project_user';
import Tenant from './tenant';

export default class TenantProject extends Model {
	static get tableName() {
		return 'tenant_projects';
	}

	static get relationMappings() {
		return {
			tenant: {
				relation: Model.BelongsToOneRelation,
				modelClass: Tenant,
				filter: query => query.select('id', 'domain', 'name', 'created_at'),
				join: {
					from: 'tenant_projects.tenant_id',
					to: 'tenants.id'
				}
			},
			project_users: {
				relation: Model.HasManyRelation,
				modelClass: ProjectUser,
				filter: query => query.select('id', 'user_id', 'project_id', 'created_at'),
				join: {
					from: 'tenant_projects.id',
					to: 'project_users.project_id'
				}
			}
		};
	}
}
