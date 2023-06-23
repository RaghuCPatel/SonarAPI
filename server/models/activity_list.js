import { Model } from '../setup/db';

export default class ActivityList extends Model {
	static get tableName() {
		return 'activity_list';
	}
}
