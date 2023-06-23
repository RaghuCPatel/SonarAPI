import { Model } from '../setup/db';
import ProjectGroup from './project_group';
import Tenant from './tenant';
import TenantProject from './tenant_project';

export default class TestUnit extends Model {
	static get tableName() {
		return 'test_units';
	}

	static get relationMappings() {
		return {
			tenant: {
				relation: Model.BelongsToOneRelation,
				modelClass: Tenant,
				filter: query => query.select('id', 'domain', 'name', 'created_at'),
				join: {
					from: 'tenant_units.tenant_id',
					to: 'tenants.id'
				}
			},
			project: {
				relation: Model.BelongsToOneRelation,
				modelClass: TenantProject,
				filter: query => query.select('id', 'tenant_id', 'display_name', 'is_active', 'created_at'),
				join: {
					from: 'test_units.project_id',
					to: 'tenant_projects.id'
				}
			},
			group: {
				relation: Model.BelongsToOneRelation,
				modelClass: ProjectGroup,
				filter: query => query.select('id', 'tenant_id', 'project_id', 'display_name', 'is_active', 'created_at'),
				join: {
					from: 'test_units.group_id',
					to: 'project_groups.id'
				}
			}
		};
	}
}
