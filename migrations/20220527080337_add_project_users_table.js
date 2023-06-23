
exports.up = function(knex) {
	return knex.schema.createTable('project_users', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('user_id').notNullable().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('project_id').notNullable().references('id').inTable('tenant_projects').onUpdate('CASCADE').onDelete('CASCADE');
		table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
		table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('project_users');
};
