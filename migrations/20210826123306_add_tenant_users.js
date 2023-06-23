exports.up = function(knex) {
	return knex.schema.createTable('tenant_users', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('user_id').notNullable().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onUpdate('CASCADE').onDelete('CASCADE');
		table.string('accepted_version');
		table.unique(['user_id', 'tenant_id'], 'tenant_user_unique_index');
		table.timestamps(true, true);
	});
};
exports.down = function(knex) {
	return knex.schema.dropTable('tenant_users');
};
