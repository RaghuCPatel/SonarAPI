
exports.up = async function(knex) {
	await knex.raw('CREATE SEQUENCE tenant_projects_code_seq;');
	await knex.raw("SELECT setval('tenant_projects_code_seq', 1000);");
	return await knex.schema.alterTable('tenant_projects', function(table) {
		table.integer('display_id').notNull().defaultTo(knex.raw("nextval('tenant_projects_code_seq')"));
	});
};

exports.down = function(knex) {
	return knex.schema.alterTable('tenant_projects', function(table) {
		table.dropColumn('display_id');
	});
};
