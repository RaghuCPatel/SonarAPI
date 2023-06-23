
exports.up = function(knex) {
	return knex.schema.alterTable('roles', table => {
		table.string('display_name');
	});
};

exports.down = function(knex) {
	return knex.schema.alterTable('roles', table => {
		table.dropColumn('display_name');
	});
};
