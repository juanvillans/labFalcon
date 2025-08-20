export async function up(knex) {
  // Check if the old column exists and rename it
  const hasOldColumn = await knex.schema.hasColumn('analysis', 'allvalidated');
  const hasNewColumn = await knex.schema.hasColumn('analysis', 'all_validated');
  
  if (hasOldColumn && !hasNewColumn) {
    await knex.schema.alterTable('analysis', (table) => {
      table.renameColumn('allvalidated', 'all_validated');
    });
    console.log('✅ Renamed column allvalidated to all_validated');
  } else if (!hasOldColumn && !hasNewColumn) {
    // If neither exists, create the new column
    await knex.schema.alterTable('analysis', (table) => {
      table.boolean('all_validated').defaultTo(false);
    });
    console.log('✅ Created new column all_validated');
  } else {
    console.log('✅ Column all_validated already exists');
  }
}

export async function down(knex) {
  // Reverse the migration
  const hasNewColumn = await knex.schema.hasColumn('analysis', 'all_validated');
  
  if (hasNewColumn) {
    await knex.schema.alterTable('analysis', (table) => {
      table.renameColumn('all_validated', 'allvalidated');
    });
    console.log('✅ Reverted column all_validated to allvalidated');
  }
}
