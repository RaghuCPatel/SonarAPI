
exports.up = function(knex) {
	return knex.schema.createTable('test_units', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('project_id').notNullable().references('id').inTable('tenant_projects').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('group_id').notNullable().references('id').inTable('project_groups').onUpdate('CASCADE').onDelete('CASCADE');
		table.string('display_name').notNullable();
		table.string('description');
		table.boolean('is_active').defaultTo('true');
		table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
		table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('test_units');
};
