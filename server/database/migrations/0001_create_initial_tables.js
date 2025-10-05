export async function up(knex) {
  await knex.raw(`
      CREATE TYPE message_status_enum AS ENUM ('NO_ENVIADO', 'ENVIADO', 'LEIDO')
    `);

  // Create trigger function for updated_at
  await knex.raw(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

  // Check if table exists before creating

  const originsTableExists = await knex.schema.hasTable("origins");
  if (!originsTableExists) {
    await knex.schema.createTable("origins", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
    });
  }

  const usersTableExists = await knex.schema.hasTable("users");
  if (!usersTableExists) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("first_name").notNullable();
      table.string("email").notNullable().unique();
      table.string("last_name").notNullable();
      table.boolean("allow_validate_exam").defaultTo(false);
      table.boolean("allow_handle_users").defaultTo(false);
      table.boolean("allow_handle_exams").defaultTo(false);
      table.string("password");
      table.string("status").notNullable();
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    });
  }

  const examTypesExists = await knex.schema.hasTable("examination_types");
  if (!examTypesExists) {
    await knex.schema.createTable("examination_types", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.jsonb("tests").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  const examsTableExist = await knex.schema.hasTable("exams");
  if (!examsTableExist) {
    await knex.schema.createTable("exams", (table) => {
      table.increments("id").primary().unique();
      table
        .integer("examination_type_id")
        .unsigned()
        .references("id")
        .inTable("examination_types");
      table.string("method");
      table.string("observation");
      table.jsonb("tests_values").notNullable();
      table.boolean("validated").defaultTo(false);
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    });
  }

  const analysisTableExists = await knex.schema.hasTable("analysis");
  if (!analysisTableExists) {
    await knex.schema.createTable("analysis", (table) => {
      table.increments("id").primary().unique();
      table.integer("origin_id").unsigned().references("id").inTable("origins");
      table.string("ci").notNullable();
      table.string("last_name").notNullable();
      table.string("first_name").notNullable();
      table.date("date_birth").notNullable();
      table.string("email");
      table.string("phone_number");
      table.string("address");
      table.string("sex");
      table.integer("age").notNullable();
      table.boolean("all_validated").defaultTo(false);
      table
        .enum("message_status", ["NO_ENVIADO", "ENVIADO", "LEIDO"])
        .defaultTo("NO_ENVIADO");
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    });
  }
  const analysis_examsTableExists = await knex.schema.hasTable(
    "analysis_exams"
  );

  if (!analysis_examsTableExists) {
    await knex.schema.createTable("analysis_exams", (table) => {
      table.increments("id").primary().unique();
      table
        .integer("analysis_id")
        .unsigned()
        .references("id")
        .inTable("analysis")
        .onDelete("CASCADE");
      table
        .integer("id_exam")
        .unsigned()
        .references("id")
        .inTable("exams")
        .onDelete("CASCADE");
    });
  }

  // Apply trigger to analysis table
  await knex.raw(`
      CREATE TRIGGER update_analysis_updated_at 
      BEFORE UPDATE ON analysis 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

  // Apply trigger to other tables
  await knex.raw(`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
}

export async function down(knex) {
  // Eliminar triggers primero
  await knex.raw(
    "DROP TRIGGER IF EXISTS update_analysis_updated_at ON analysis"
  );
  await knex.raw("DROP TRIGGER IF EXISTS update_users_updated_at ON users");

  // Eliminar función
  await knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column()");

  // Eliminar tablas en orden correcto (por dependencias)
  await knex.schema.dropTableIfExists("analysis_exams");
  await knex.schema.dropTableIfExists("exams");
  await knex.schema.dropTableIfExists("analysis");
  await knex.schema.dropTableIfExists("examination_types");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists('origins');

  // Eliminar enum al final
  await knex.raw("DROP TYPE IF EXISTS message_status_enum");
}
