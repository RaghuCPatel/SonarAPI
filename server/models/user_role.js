import { Model } from '../setup/db';
import Role from './role';
import User from './user';

export default class UserRole extends Model {
	static get tableName() {
		return 'users_roles';
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				filter: (query) =>
					query.select(
						'id',
						'first_name',
						'last_name',
						'gender',
						'email',
						'phone_number',
						'created_at'
					),
				join: {
					from: 'users_roles.user_id',
					to: 'users.id'
				}
			},
			role: {
				relation: Model.BelongsToOneRelation,
				modelClass: Role,
				filter: query => query.select('id', 'name'),
				join: {
					from: 'users_roles.role_id',
					to: 'roles.id'
				}
			}
		};
	}
}
