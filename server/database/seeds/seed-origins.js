// Datos de origenes
const originsSeed = [
  { name: "Otros" },
  { name: "Externo" },
  { name: "Hospitalizado" },
  { name: "Jubilado" },
  { name: "Familiar" },
  { name: "Jornada" },
  { name: "Caso social" },
  { name: "Plan Quirúrgico" },
  { name: "UBCH" },
  { name: "Trabajador" },
];

export async function seed(knex) {
  // Verifica si ya hay registros
  const count = await knex("origins").count("id");
  if (parseInt(count[0].count) > 0) {
    console.log("Reseteando tabla origins...");
    await knex.raw("ALTER SEQUENCE origins_id_seq RESTART WITH 1");
    await knex("origins").del();
  }

  // Inserta los nuevos registros
  await knex("origins").insert(originsSeed);
  console.log("✅ Seed de origins completado correctamente.");
}
