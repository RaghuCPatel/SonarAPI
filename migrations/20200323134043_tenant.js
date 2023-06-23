exports.up = function(knex) {
	return Promise.all([
		knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto'),
		knex.schema.createTable('tenants', function(table) {
			table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
			table.string('title').notNull();
			table.string('domain').notNull();
			table.string('logo_url');
			table.boolean('is_active').defaultTo(false);
			table.uuid('api_key').defaultTo(knex.raw('gen_random_uuid()'));
			table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
			table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
		})
	]);
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('tenants');
};
