'use strict';
import { createClient } from 'async-redis';

const config = {
	port: process.env.SERVICES_CACHE_PORT || 6379,
	host: process.env.SERVICES_CACHE_HOST || '127.0.0.1',

	options: {
		retry_max_delay:
			process.env.SERVICES_CACHE_OPTIONS_RETRY_MAX_DELAY || 500,
		max_attempts: process.env.SERVICES_CACHE_OPTIONS_MAX_ATTEMPTS || 5
	}
};
console.log(config);
const cache = createClient(config.port, config.host, config.options);

export default cache;
