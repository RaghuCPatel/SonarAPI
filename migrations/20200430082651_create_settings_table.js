exports.up = function(knex) {
    return knex.schema.createTable('settings', function(t) {
				t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
        t.string('key').unique().notNullable();
        t.string('value').nullable();
        t.timestamps(true,true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("settings");
};
