
exports.up = function(knex) {
	return knex.schema.alterTable('activity_list', function(table) {
		table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onUpdate('CASCADE').onDelete('CASCADE');
	});
};

exports.down = function(knex) {
	return knex.schema.alterTable('activity_list', table => {
		table.dropColumn('tenant_id');
	});
};
