'use strict';

import _knex from 'knex';
import { Model } from 'objection';
import dotenv from 'dotenv';
const testConfig = require('../../knexfile').test;
dotenv.config();

let dbConfig = {
	client: process.env.DATABASE_CLIENT || 'pg',
	debug: true,

	connection: {
		host: process.env.DATABASE_HOST || '127.0.0.1',
		port: process.env.DATABASE_PORT || '5432',
		user: process.env.DATABASE_USER || 'postgres',
		password: process.env.DATABASE_PASSWORD || '123456',
		database: process.env.DATABASE_NAME || 'postgres'
	},
	pool: {
		min: process.env.DATABASE_MIN_POOL_SIZE || 2,
		max: process.env.DATABASE_MAX_POOL_SIZE || 4
	}
};
if (process.env.DATABASE_DEBUG_MODE) {
	dbConfig.debug = true;
}
if (process.env.NODE_ENV === 'test') {
	console.log(`Loading config for environment: ${process.env.NODE_ENV} with config ${JSON.stringify(testConfig)}`);
	dbConfig = testConfig;
}
// console.log(dbConfig);
const knex = _knex(dbConfig);

Model.knex(knex);

export { knex, Model };
