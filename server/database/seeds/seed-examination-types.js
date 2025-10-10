
// Examination types seed data
const examinationTypesSeed = [
  {
    id: 1,
    name: "Hematologia",

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
    id: 2,
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
    id: 3,
    name: "Prueba de coagulación",
    tests: [
      {
        label: "TP paciente",
        name: "tp_paciente",
        type: "number",
        unit: "seg",
        reference_range: {
          min: 10,
          max: 14,
        },
      },
      
      {
        label: "TPT paciente",
        name: "tpt_paciente",
        type: "number",
        unit: "seg",
        reference_range: {
          min: 25,
          max: 35,
        },
      },
      {
        label: "Control TP",
        name: "tp_control",
        type: "number",
        unit: "seg",
      },
      {
        label: "Control TPT",
        name: "tpt_control",
        type: "number",
        unit: "seg",
      },
      {
        label: "Razón p/c",
        name: "razon",
        type: "number",
        unit: "VN",
      },
      {
        label: "Diferencia p-c",
        name: "diferencia",
        type: "number",
        unit: "VN",
      },
    ],
  },

  {
    id: 4,
    name: "Serología",

    tests: [
      {
        label: "HIV",
        name: "hiv",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "Pyloriset",
        name: "pyloriset",
        type: "select",
        options: [{ value: "Positivo" }, { value: "Negativo" }],
      },

      {
        label: "VDRL",
        name: "vdrl",
        type: "list",
        labels: [
          "No reactivo",
          "Reactivo",
          "Reactivo 2dil",
          "Reactivo 4dil",
          "Reactivo 8dil",
          "Reactivo 16dil",
          "Reactivo 32dil",
          "Reactivo 64dil",
          "Reactivo 128dil",
          "Reactivo 256dil",
          "Reactivo 512dil",
          "Reactivo 1024dil",
        ],
      },
      {
        label: "Dengue",
        name: "dengue",
        type: "select",
        options: [{ value: "Positivo" }, { value: "Negativo" }],
      },
      {
        label: "VHA",
        name: "vha",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "TEST-PACK HCG",
        name: "test_pack_hcg",
        type: "select",
        options: [{ value: "Positivo" }, { value: "Negativo" }],
      },
      {
        label: "VHB AGS",
        name: "vhb_ags",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },

      {
        label: "HCV",
        name: "hcv",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "VHB anticore",
        name: "vhb_anticore",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "Sangre oculta en heces",
        name: "sangre_oculta_en_heces",
        type: "select",
        options: [{ value: "Positivo" }, { value: "Negativo" }],
      },
    ],
  },

  {
    id: 5,
    name: "Análisis de heces",

    tests: [
      {
        label: "Aspecto",
        name: "aspecto",
        type: "list",
        labels: ["Heterogeneo", "Homogeneo"],
      },
      {
        label: "Color",
        name: "color",
        type: "list",
        labels: ["Marrón", "Amarillo", "Pardo", "Negro", "Rojo", "Verde"],
      },
      {
        label: "Consistencia",
        name: "consistencia",
        type: "list",
        labels: ["Blanda", "Dura", "Pastosa", "Diarreica"],
      },

      {
        label: "Olor",
        name: "olor",
        type: "list",
        labels: ["Fecal", "Fétido"],
      },
      {
        label: "Moco",
        name: "moco",
        type: "boolean",
        labels: { true: "Presente", false: "No observado" },
      },
      {
        label: "Sangre",
        name: "sangre",
        type: "boolean",
        labels: { true: "Presente", false: "No observado" },
      },
      {
        label: "Reacción",
        name: "reaccion",
        type: "list",
        labels: ["Acida", "Alcalina"],
      },
      {
        label: "Restos alimenticios",
        name: "restos_alimenticios",
        type: "boolean",
        labels: { true: "Presente", false: "No observado" },
      },
    ],
  },

  {
    id: 6,
    name: "Hepatitis A, B, C",
    tests: [
      {
        label: "HAV",
        name: "hav",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "AgSHB",
        name: "agshb",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "Anticore",
        name: "anticore",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
      {
        label: "HCV",
        name: "hcv",
        type: "select",
        options: [{ value: "Reactivo" }, { value: "No reactivo" }],
      },
    ],
  },





  {
    id: 7,
    name: "Análisis de orina",
    tests: [
      /////// Examen Físico
      {
        label: "Aspecto",
        name: "aspecto",
        type: "list",
        labels: ["límpida", "Turbio", "Ligeramente Turbio", "Cristalizada"],
      },
      {
        label: "Color",
        name: "color",
        type: "list",
        labels: ["Amarillo", "Ambar", "Negro", "Rojo", "Verde"],
      },
      {
        label: "Olor",
        name: "olor",
        type: "list",
        labels: ["Amoniacal", "Fétido"],
      },
      {
        label: "Reacción",
        name: "reaccion",
        type: "list",
        labels: ["Acida", "Alcalina", "Neutral"],
      },
      {
        label: "pH",
        name: "ph",
        type: "list",
        unit: "pH",
        labels: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5"],
        reference_range: {
          min: 5,
          max: 8.5,
        },
      },

      /// Examen Químico

      {
        label: "Albúmina",
        name: "albumina",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Hemoglobina",
        name: "hemoglobina",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Urobilina",
        name: "urobilina",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Glucosa",
        name: "glucosa",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Acetona",
        name: "acetona",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Pigmentos bilares",
        name: "pigmentos_bilares",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Nitritos",
        name: "nitritos",
        type: "list",
        labels: [
          "Negativo",
          "Positivo 1+",
          "Positivo 2++",
          "Positivo 3+++",
          "Positivo 4++++",
        ],
      },
      {
        label: "Otros",
        name: "otros_quimicos",
        type: "string",
      },

      ///  Examen Microscópico

      {
        section: true,
        label: "Bacterias",
        name: "bacterias",
        type: "string",
      },
      {
        label: "Células epiteliales",
        name: "celulas_epiteliales",
        type: "string",
      },
      {
        label: "Leucocitos",
        name: "leucitos",
        type: "string",
      },
      {
        label: "Hematies",
        name: "hematies",
        type: "string",
      },
      {
        label: "Cilindros",
        name: "cilindros",
        type: "string",
      },
      {
        label: "Cristales",
        name: "cristales",
        type: "string",
      },

      {
        label: "Otros",
        name: "otros_microscopicos",
        type: "string",
      },
    ],
  },
];

export async function seed(knex) {
  const inserts = [];
  const updates = [];
  
  // Get all existing IDs for efficient lookup
  const existingRecords = await knex("examination_types").select("id");
  const existingIds = new Set(existingRecords.map(record => record.id));
  
  for (const examType of examinationTypesSeed) {
    if (existingIds.has(examType.id)) {
      // Record exists, prepare update
      updates.push(
        knex("examination_types")
          .where("id", examType.id)
          .update({
            name: examType.name,
            tests: JSON.stringify(examType.tests),
          })
      );
    } else {
      // New record, prepare insert
      inserts.push({
        id: examType.id, // Include the stable ID
        name: examType.name,
        tests: JSON.stringify(examType.tests),
      });
    }
  }
  
  // Execute all operations in parallel
  if (updates.length > 0) {
    await Promise.all(updates);
    console.log(`Updated ${updates.length} examination types`);
  }
  
  if (inserts.length > 0) {
    await knex("examination_types").insert(inserts);
    console.log(`Inserted ${inserts.length} new examination types`);
  }
  
  if (updates.length === 0 && inserts.length === 0) {
    console.log("No changes needed - data is already in sync");
  }
}