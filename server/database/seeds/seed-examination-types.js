
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
        label: "Cuenta blanca",
        name: "cuenta_blanca",
        type: "number",
        unit: "x10³",
        reference_range: {
          min: 4,
          max: 10,
        },
      },
      {
        label: "Linfocitos",
        name: "linfocitos",
        type: "number",
        unit: "%",
        reference_range: {
          min: 20,
          max: 40,
        },
      },
      {
        label: "MID",
        name: "mid",
        type: "number",
        unit: "%",
        reference_range: {
          min: 0,
          max: 10,
        },
      },
      {
        label: "Neutrofilos",
        name: "neutrofilos",
        type: "number",
        unit: "%",
        reference_range: {
          min: 50,
          max: 70,
        },
      },
      {
        label: "Hemoglobina",
        name: "hemoglobina",
        type: "number",
        unit: "gr/dl",
        reference_range: {
          min: 11,
          max: 16,
        },
      },
      {
        label: "Hematocrito",
        name: "hematocrito",
        type: "number",
        unit: "%",
        reference_range: {
          min: 36,
          max: 45,
        },
      },
      {
        label: "Plaquetas",
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
    name: "Química sanguinea",
    tests: [
      {
        label: "Glucosa",
        name: "glucosa",
        type: "number",
        unit: "mg/dl",
        reference_range: {
          min: 70,
          max: 100,
        },
      },
      {
        label: "Urea",
        name: "urea",
        type: "number",
        unit: "mg/dl",
        reference_range: {
          min: 6,
          max: 24,
        },
      },
      {
        label: "Creatinina",
        name: "creatinina",
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
        label: "TP",
        name: "tp",
        type: "number",
        unit: "seg",
        reference_range: {
          min: 10,
          max: 14,
        },
      },
      {
        label: "TPT",
        name: "tpt",
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
        label: "HIV",
        name: "hiv",
        type: "boolean",
        labels: {true: "Reactivo", false: "No reactivo"},
      },
      {
        label: "VDRL",
        name: "vdrl",
        type: "boolean",
        labels: {true: "Reactivo", false: "No reactivo"},
      },
    ]
  },
  {
    name: "Análisis de heces",
    tests: [
      {
        label: "Color",
        name: "color",
        type: "string",
        labels: {
          "Negro": "Negro",
          "Marrón": "Marrón",
          "Amarillo": "Amarillo",
          "Blanco": "Blanco",
        },
      },
      {
        label: "Aspecto",
        name: "aspecto",
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

export async function seed(knex) {
  const count = await knex('examination_types').count('id');
  if (parseInt(count[0].count) > 0) {
    console.log("Examination types already exist. Seeding skipped.");
    return;
  }

  for (const examType of examinationTypesSeed) {
    await knex('examination_types').insert({
      name: examType.name,
      tests: JSON.stringify(examType.tests),
    });
    console.log(`Seeded: ${examType.name}`);
  }
}
