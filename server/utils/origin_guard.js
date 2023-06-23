import { DEV_ORIGIN_REGEX, PROD_ORIGIN_REGEX } from '../config';

export function allowOrigins() {
	let allowedRegex = null;
	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing') {
		allowedRegex = DEV_ORIGIN_REGEX;
	} else if (process.env.NODE_ENV === 'production') {
		allowedRegex = PROD_ORIGIN_REGEX;
	}
	return Promise.resolve(allowedRegex);
}
