import { pool } from "../database/postgre.js";
import dotenv from "dotenv";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" 
  ? ".env.production" 
  : ".env.development.local";

dotenv.config({ path: envFile });

// Examination types seed data
const examinationTypesSeed = [
  {
    name: "hematologia",
    tests: [
      {
        name: "Cuenta blanca",
        type: "number",
        unit: "x10³",
        reference_range: {
          min: 4,
          max: 10,
        },
      },
      {
        name: "Linfocitos",
        type: "number",
        unit: "%",
        reference_range: {
          min: 20,
          max: 40,
        },
      },
      {
        name: "MID",
        type: "number",
        unit: "%",
        reference_range: {
          min: 0,
          max: 10,
        },
      },
      {
        name: "Neutrofilos",
        type: "number",
        unit: "%",
        reference_range: {
          min: 50,
          max: 70,
        },
      },
      {
        name: "Hemoglobina",
        type: "number",
        unit: "gr/dl",
        reference_range: {
          min: 11,
          max: 16,
        },
      },
      {
        name: "Hematocrito",
        type: "number",
        unit: "%",
        reference_range: {
          min: 36,
          max: 45,
        },
      },
      {
        name: "Plaquetas",
        type: "number",
        unit: "x10³",
        reference_range: {
          min: 100,
          max: 350,
        },
      },
    ],
  },
  {
    name: "Química sangupinea",
    tests: [
      {
        name: "Glucosa",
        type: "number",
        unit: "mg/dl",
        reference_range: {
          min: 70,
          max: 100,
        },
      },
      {
        name: "Urea",
        type: "number",
        unit: "mg/dl",
        reference_range: {
          min: 6,
          max: 24,
        },
      },
      {
        name: "Creatinina",
        type: "number",
        unit: "mg/dl",
        reference_range: {
          min: 0.6,
          max: 1.1,
        },
      },
    ],
  },
  {
    name: "Prueba de coagulación",
    tests: [
      {
        name: "TP",
        type: "number",
        unit: "seg",
        reference_range: {
          min: 10,
          max: 14,
        },
      },
      {
        name: "TPT",
        type: "number",
        unit: "seg",
        reference_range: {
          min: 25,
          max: 35,
        },
      },
    ],
  },
  {
    name: "Serología",
    tests: [
      {
        name: "HIV",
        type: "boolean",
        labels: {true: "Reactivo", false: "No reactivo"},
      },
      {
        name: "VDRL",
        type: "boolean",
        labels: {true: "Reactivo", false: "No reactivo"},
      },
    ]
  },
  {
    name: "Análisis de heces",
    tests: [
      {
        name: "Color",
        type: "string",
        labels: {
          "Negro": "Negro",
          "Marrón": "Marrón",
          "Amarillo": "Amarillo",
          "Blanco": "Blanco",
        },
      },
      {
        name: "Aspecto",
        type: "string",
        labels: {
          "Fresco": "Fresco",
          "Seco": "Seco",
          "Viscoso": "Viscoso",
        },
      },
    ],  
  }
];

async function seedExaminationTypes() {
  try {
    // Check if examination types already exist
    const { rows } = await pool.query("SELECT COUNT(*) FROM examination_types");
    const count = parseInt(rows[0].count);
    
    if (count > 0) {
      console.log("Examination types already exist in the database. Seeding skipped.");
      return;
    }
    
    console.log("Starting to seed examination types...");
    
    // Insert each examination type
    for (const examType of examinationTypesSeed) {
      await pool.query(
        `INSERT INTO examination_types (name, tests) VALUES ($1, $2)`,
        [examType.name, JSON.stringify(examType.tests)]
      );
      console.log(`Added examination type: ${examType.name}`);
    }
    
    console.log("✅ Examination types seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding examination types:", error.message);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seeder
seedExaminationTypes();