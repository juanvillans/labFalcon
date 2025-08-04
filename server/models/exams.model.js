import { db } from "../database/postgre.js";

class Exams {
  constructor(data) {
    this.id = data.id || null;
    this.tests_values = data.tests_values;
    this.examination_type_id = data.test
    this.validated = data.validated;
  }
  static async createWithTransaction(trx, examData) {
    try {
      const [exam] = await trx("exams")
        .insert({
          examination_type_id: examData.testTypeId,
          validated: examData.validated,
          tests_values: JSON.stringify(examData.tests_values),
        })
        .returning("*");

      return new Exams({ ...exam});
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Exam with this CI already exists");
      } else if (error.code === "23503") {
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

  static async deleteMultipleWithTransaction(trx, examIds) {
    try {
      if (examIds.length > 0) {
        await trx("exams")
          .whereIn("id", examIds)
          .del();
      }
      return true;
    } catch (error) {
      throw new Error("Failed to delete exams");
    }
  }

  static async deleteMultiple(examIds) {
    try {
      if (examIds.length > 0) {
        await db("exams")
          .whereIn("id", examIds)
          .del();
      }
      return true;
    } catch (error) {
      throw new Error("Failed to delete exams");
    }
  }
}

export default Exams;
