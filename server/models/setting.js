import { Model } from '../setup/db';

export default class Setting extends Model {
	static get tableName() {
		return 'settings';
	}
}
