export async function up(knex) {
  // Create origins table
  await knex.schema.createTable('origins', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
  });

  // Add origin_id to analysis table
  await knex.schema.table('analysis', (table) => {
    table.integer('origin_id').unsigned();
    table.foreign('origin_id').references('origins.id');
  });

  // Insert default origins
  await knex('origins').insert([
    { name: 'Externo' },
    { name: 'Hospitalizado' },
    { name: 'Jubilado' },
    { name: 'Familiar' },
    { name: 'Jornada' },
    { name: 'Caso social' },
    { name: 'Plan Quirúrgico' },
    { name: 'UBCH' },
    { name: 'Otros' },
    
  ]);
}

export async function down(knex) {
  await knex.schema.table('analysis', (table) => {
    table.dropForeign('origin_id');
    table.dropColumn('origin_id');
  });
  
  await knex.schema.dropTableIfExists('origins');
}