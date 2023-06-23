import { Model } from '../setup/db';
import Tenant from './tenant';
import TenantProject from './tenant_project';

export default class ProjectGroup extends Model {
	static get tableName() {
		return 'project_groups';
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
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: TenantProject,
				filter: query => query.select('id', 'tenant_id', 'display_name', 'is_active', 'created_at'),
				join: {
					from: 'tenant_projects.project_id',
					to: 'tenant_projects.id'
				}
			}
		};
	}
}
