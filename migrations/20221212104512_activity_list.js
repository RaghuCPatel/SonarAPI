
exports.up = function(knex) {
	return knex.schema.createTable('activity_list', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('activity_name').unique().notNull();
	});
};

exports.down = function(knex) {
	return knex.schema.dropTable('activity_list');
};
