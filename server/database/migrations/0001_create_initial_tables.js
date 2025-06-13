export async function up(knex) {
  // Check if table exists before creating
  const usersTableExists = await knex.schema.hasTable('users');
  if (!usersTableExists) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('last_name').notNullable();
      table.boolean('allow_validate_exam').defaultTo(false);
      table.boolean('allow_handle_users').defaultTo(false);
      table.string('password');
      table.string('status').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }

  const examTypesExists = await knex.schema.hasTable('examination_types');
  if (!examTypesExists) {
    await knex.schema.createTable('examination_types', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.jsonb('tests').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('examination_types');
  await knex.schema.dropTableIfExists('users');
}