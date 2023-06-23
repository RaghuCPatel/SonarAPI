exports.up = async function(knex) {
	return await knex.schema.raw('ALTER TABLE activity_list DROP CONSTRAINT activity_list_activity_name_unique;');
};

exports.down = async function(knex) {
	return await knex.schema.raw('ALTER TABLE activity_list ADD CONSTRAINT activity_list_activity_name_unique UNIQUE("activity_name");');
};
