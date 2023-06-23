import { SETTINGS_CACHE_PREFIX } from '../config';
import Setting from '../models/setting';
import cache from '../setup/redis';
export async function get(key) {
	let entryFromCache = await cache.get(key);
	if (entryFromCache === null) {
		const settingData = await Setting.query().findOne(
			{ key: key });
		entryFromCache = settingData.value;
		await cache.set(SETTINGS_CACHE_PREFIX + key, entryFromCache);
	}
	console.log('Got', entryFromCache);
	return entryFromCache;
}
export async function set(key, value) {
	await Setting.query().update({
		value: value
	}).where('key', key);
	await cache.del(SETTINGS_CACHE_PREFIX + key);
}
