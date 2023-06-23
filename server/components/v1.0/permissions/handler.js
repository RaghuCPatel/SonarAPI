import { getCapabilties, getpermissions } from '../../../services/permissions';

export async function _getpermissions() {
	const result = await getpermissions();
	return Promise.resolve(result);
}
export async function _getCapabilities(roles) {
	const result = await getCapabilties(roles);
	return Promise.resolve(result);
}
