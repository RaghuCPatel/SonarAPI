import dotenv from 'dotenv';
import chai from 'chai';
import { PostgreSqlContainer, GenericContainer } from 'testcontainers';
import knex from 'knex';
const asyncRedis = require('async-redis');
dotenv.config();
const expect = chai.expect;
describe('Settings', () => {
	let pgContainer;
	let knexTestSetup;
	let cacheContainer;
	let redisClient;
	beforeAll(async() => {
		pgContainer = await new PostgreSqlContainer()
			.withUsername('postgres')
			.withPassword('postgres')
			.withDatabase('api_server_test')
			.start();
		cacheContainer = await new GenericContainer('redis')
			.withExposedPorts(6379)
			.start();

		redisClient = asyncRedis.createClient(
			cacheContainer.getMappedPort(6379),
			cacheContainer.getHost()
		);
		process.env.PG_PORT = pgContainer.getMappedPort(5432);
		process.env.SERVICES_CACHE_PORT = cacheContainer.getMappedPort(6379);
		// console.log(process.env.PG_PORT);
		const knexTestConfig = require('../../../knexfile').test;
		knexTestConfig.connection.port = process.env.PG_PORT;
		// console.log(knexTestConfig);
		delete require.cache[require.resolve('knex')];
		knexTestSetup = knex(knexTestConfig);
		await knexTestSetup.migrate.latest();
		await knexTestSetup.seed.run();
	});

	afterAll(async() => {
		await redisClient.quit();
		await pgContainer.stop();
		await cacheContainer.stop();
	});

	it('should return data from cache if present', async() => {
		// put some data in the cache
		await redisClient.set('wmo_setting!OTP!EXPIRY!TIME', '1222');
		// call the dao
		const functions = await import('../settings_dao');

		const result = await functions.get('wmo_setting!OTP!EXPIRY!TIME');
		expect(result).to.equal('1222');
		// ensure same data comes out
	});
	it('should return data from db if cache is not present', async() => {
		const functions = await import('../settings_dao');
		await redisClient.del('wmo_setting!OTP!EXPIRY!TIME');
		const result = await functions.get('OTP!EXPIRY!TIME');
		expect(result).to.equal('180');
	});
	it('should cache data if not present', async() => {
		const functions = await import('../settings_dao');
		await redisClient.del('wmo_setting!OTP!EXPIRY!TIME');
		const result = await functions.get('OTP!EXPIRY!TIME');
		const x = await redisClient.get('wmo_setting!OTP!EXPIRY!TIME');
		expect(result).to.equal(x);
	});
	it('should clear cache data if updated', async() => {
		await redisClient.set('wmo_setting!OTP!EXPIRY!TIME', '1222');
		const functions = await import('../settings_dao');
		await functions.set('OTP!EXPIRY!TIME', '2000');
		const x = await redisClient.get('wmo_setting!OTP!EXPIRY!TIME');
		expect(x).to.equal(null);
	});
});
