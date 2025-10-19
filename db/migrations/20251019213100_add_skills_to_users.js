/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // The 'up' function is what runs when you migrate.
  // It tells Knex to alter the 'user' table.
  return knex.schema.table('user', function(table) {
    // This line adds a new column called 'Skills' with the datatype 'TEXT'.
    table.text('Skills').comment('User-defined skills, comma-separated');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // The 'down' function is the "undo" button. It runs when you rollback.
  // It tells Knex to alter the 'user' table again.
  return knex.schema.table('user', function(table) {
    // This line removes the 'Skills' column.
    table.dropColumn('Skills');
  });
};

