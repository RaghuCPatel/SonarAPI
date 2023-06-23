
exports.up = function(knex) {
	return knex.schema.alterTable('tenant_projects', table => {
		table.specificType('meta', 'jsonb');
	});
};

exports.down = function(knex) {
	return knex.schema.alterTable('tenant_projects', table => {
		table.dropColumn('meta', 'jsonb');
	});
};
