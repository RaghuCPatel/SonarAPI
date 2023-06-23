
exports.up = function(knex) {
	return knex.schema.createTable('project_groups', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('project_id').notNullable().references('id').inTable('tenant_projects').onUpdate('CASCADE').onDelete('CASCADE');
		table.string('display_name').notNullable();
		table.boolean('is_active').defaultTo('true');
		table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
		table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('project_groups');
};
