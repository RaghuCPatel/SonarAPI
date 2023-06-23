
exports.up = function(knex) {
    return knex.schema.createTable("roles", function (table) {
        table.uuid('id').unique().notNull().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNull();
        table.string('type');
    })
  
};
exports.down = function(knex, Promise) {
  return knex.schema.dropTable("roles")
};
