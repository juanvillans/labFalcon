import { db } from "../database/postgre.js";

class Exam {
  constructor(data) {
    this.id = data.patient.id;
    this.ci = data.patient.ci;
    this.last_name = data.patient.last_name;
    this.first_name = data.patient.first_name;
    this.date_birth = data.patient.date_birth;
    this.email = data.patient.email;
    this.phone_number = data.patient.phone_number;
    this.address = data.patient.address;
    this.gender = data.patient.gender;
    this.test_type_id = data.testTypeId;
    this.test_values = data.testsValues;
    this.test_type_name = data.testTypeName;
    this.validated = data.validated;
  }

  static async create(examData) {
    try {
      const [exam] = await db("exams")
        .insert({
          ci: examData.ci,
          last_name: examData.last_name,
          first_name: examData.first_name,
          date_birth: examData.date_birth,
          email: examData.email,
          phone_number: examData.phone_number,
          address: examData.address,
          gender: examData.gender,
          examination_type_id: examData.testTypeId,
          test_values: JSON.stringify(examData.testsValues),
          validated: examData.validated,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning("*");

      return new Exam(exam);
    } catch (error) {
      if (error.code === "23505") {
        // PostgreSQL unique violation error code
        throw new Error("Exam with this CI already exists");
      }
      throw error;
    }
  }

  static async getAllExams() {
    const exams = await db("exams").select("*");
    return exams.map((exam) => new Exam(exam));
  }

  static async getExamById(id) {
    const exam = await db("exams").where("id", id).first();

    return exam ? new Exam(exam) : null;
  }

  static async updateExam(id, updateData) {
    const updates = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update");
    }

    updates.updated_at = db.fn.now();

    try {
      const [updatedExam] = await db("exams")
        .where("id", id)
        .update(updates)
        .returning("*");

      return new Exam(updatedExam);
    } catch (error) {
      // Handle errors...
    }
  }

  static async deleteExam(id) {
    try {
      await db("exams").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error("Failed to delete exam");
    }
  }
}

export default Exam;