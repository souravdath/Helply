/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries from the service_category table to prevent duplicates.
  await knex('service_category').del();
  
  // Inserts the new seed entries into the table.
  await knex('service_category').insert([
    { Service_ID: 1, Name: 'Babysitting', Description: 'Child care and babysitting services' },
    { Service_ID: 2, Name: 'Tuition', Description: 'Academic tutoring and teaching services' },
    { Service_ID: 3, Name: 'Cleaning', Description: 'Home and office cleaning services' },
    { Service_ID: 4, Name: 'Electrical', Description: 'Electrical repair and installation' },
    { Service_ID: 5, Name: 'Cooking', Description: 'Personal cooking and meal prep services' },
    { Service_ID: 6, Name: 'Gardening', Description: 'Lawn care and gardening services' }
  ]);
};

