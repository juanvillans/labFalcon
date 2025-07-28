import { db } from "../database/postgre.js";

class Exams {
  constructor(data) {
    this.id = data.id || null;
    this.test_values = data.test_values;
    this.examination_type_id = data.test
    this.validated = data.validated;

  }

  static async create(examData) {
    try {

      const [exam] = await db("Exams")
        .insert({
          examination_type_id: examData.testTypeId,
          validated: examData.validated,
          test_values: JSON.stringify(examData.testsValues),
         
        })
        .returning("*");

      return new Exams({ ...exam, patient: examData.patient });
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Exam with this CI already exists");
      } else if (error.code === "23503") { // Foreign key violation
        throw new Error("Invalid examination type ID");
      }
      throw error;
    }
  }

  static async getAll() {
    const exams = await db("exams")
      .join(
        "examination_types",
        "exams.examination_type_id",
        "examination_types.id"
      )
      .select("exams.*", "examination_types.name as examination_type_name",  db.raw("to_char(exams.date_birth, 'YYYY-MM-DD') as date_birth")
    );

    return exams.map((exam) => new Exams(exam));
  }

  static async findById(id) {
    const exam = await db("exams").where("id", id).first();

    return exam ? new Exams(exam) : null;
  }

 

  static async delete(id) {
    try {
      await db("exams").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error("Failed to delete exam");
    }
  }
}

export default Exams;