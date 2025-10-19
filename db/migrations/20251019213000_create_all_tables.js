/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Create 'user' table first (no dependencies)
    .createTable('user', function (table) {
      table.increments('User_ID').primary();
      table.string('Name', 255).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('username', 100).notNullable().unique();
      table.string('phone', 20);
      table.string('location', 255);
      table.string('password', 255).notNullable();
    })
    // 2. Create 'service_category' table (no dependencies)
    .createTable('service_category', function (table) {
      table.increments('Service_ID').primary();
      table.string('Name', 255).notNullable();
      table.text('Description');
    })
    // 3. Create 'job' table (depends on user and service_category)
    .createTable('job', function (table) {
      table.increments('Job_ID').primary();
      table.string('Title', 255).notNullable();
      table.text('Description').notNullable();
      table.string('Location', 255);
      table.decimal('Salary', 10, 2);
      table.string('Type', 100);
      table.text('Requirements');
      table.string('ContactInfo', 255).notNullable();
      table.string('JobStatus', 50).notNullable().defaultTo('Open');
      table.integer('User_id_FK').unsigned().references('User_ID').inTable('user').onDelete('CASCADE');
      table.integer('Service_id_FK').unsigned().references('Service_ID').inTable('service_category').onDelete('SET NULL');
    })
    // 4. Create 'application' table (depends on user and job)
    .createTable('application', function (table) {
      table.increments('Application_ID').primary();
      table.timestamp('applied_date').defaultTo(knex.fn.now());
      table.text('Cover_letter');
      table.string('Status', 50).notNullable().defaultTo('Pending');
      table.integer('user_id_FK').unsigned().references('User_ID').inTable('user').onDelete('CASCADE');
      table.integer('job_id_FK').unsigned().references('Job_ID').inTable('job').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Drop tables in reverse order of creation
  return knex.schema
    .dropTableIfExists('application')
    .dropTableIfExists('job')
    .dropTableIfExists('service_category')
    .dropTableIfExists('user');
};
