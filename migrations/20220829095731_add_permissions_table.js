
exports.up = function(knex) {
	return knex.schema.createTable('permissions', function(table) {
		table.uuid('id').unique().notNull().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('name').notNull();
		table.timestamps(true, true);
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('permissions');
};
