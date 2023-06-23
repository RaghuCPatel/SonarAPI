import { Model } from '../setup/db';

export default class Tenant extends Model {
	static get tableName() {
		return 'tenants';
	}
}
