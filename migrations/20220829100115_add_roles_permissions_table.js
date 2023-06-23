
exports.up = function(knex) {
	return knex.schema.createTable('roles_permissions', function(table) {
		table.uuid('id').unique().notNull().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('role_id').notNullable().references('id').inTable('roles').onUpdate('CASCADE').onDelete('CASCADE');
		table.uuid('permission_id').notNullable().references('id').inTable('permissions').onUpdate('CASCADE').onDelete('CASCADE');
		table.timestamps(true, true);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('roles_permissions');
};
