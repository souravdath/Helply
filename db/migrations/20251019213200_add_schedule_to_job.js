/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // The 'up' function adds the new columns
  return knex.schema.table('job', function(table) {
    // Adds a column for the job date, nullable since some jobs might be long-term/flexible
    table.date('ScheduledDate').nullable().comment('The date the job is scheduled to occur');
    
    // Adds a column for the job time, nullable/optional
    table.time('ScheduledTime').nullable().comment('The time the job is scheduled to occur');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // The 'down' function removes the columns on rollback
  return knex.schema.table('job', function(table) {
    table.dropColumn('ScheduledDate');
    table.dropColumn('ScheduledTime');
  });
};