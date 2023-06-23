import { Model } from '../setup/db';

export default class Permission extends Model {
	static get tableName() {
		return 'permissions';
	}
}
