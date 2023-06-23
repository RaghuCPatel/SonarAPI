exports.up = function(knex, Promise) {
	return knex.schema.createTable("users_roles", function (table) {
		table.uuid('id').unique().notNull().defaultTo(knex.raw('gen_random_uuid()'));
					table.uuid('user_id').notNull().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
					table.uuid('role_id').notNull().references('id').inTable('roles').onUpdate('CASCADE').onDelete('CASCADE');
					table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
					table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
			})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable("users_roles")
};
