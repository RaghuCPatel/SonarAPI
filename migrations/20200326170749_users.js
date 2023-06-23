
exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function(table) {
		table.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('email').unique().notNull();
		table.string('phone_number').notNull();
		table.string('first_name').notNull();
		table.string('last_name').notNull();
		table.string('encrypted_password').notNull();
		table.dateTime('last_sign_in_at');
		table.integer('sign_in_count').notNull().defaultTo(0);
		table.dateTime('created_at').notNull().defaultTo(knex.fn.now());
		table.dateTime('updated_at').notNull().defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('users');
};
