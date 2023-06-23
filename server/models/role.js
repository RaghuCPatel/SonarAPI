import { Model } from '../setup/db';

export default class Role extends Model {
	static get tableName() {
		return 'roles';
	}
}
