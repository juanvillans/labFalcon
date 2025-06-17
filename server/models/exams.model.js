import { db } from "../database/postgre.js";

class Exam {
  constructor(data) {
    this.id = data.id;
    this.ci = data.ci;
    this.last_name = data.last_name;
    this.first_name = data.first_name;
    this.age = data.age;
    this.test_type = data.test_type;
    this.origin_service = data.origin_service;
    this.date = data.date;
    this.time = data.time;
    this.validated = data.validated;
  }

  static async create(examData) {
    try {
      const [exam] = await db("exams")
        .insert({
          ci: examData.ci,
          last_name: examData.last_name,
          first_name: examData.first_name,
          age: examData.age,
          test_type: examData.test_type,
          origin_service: examData.origin_service,
          date: examData.date,
          time: examData.time,
          validated: false,
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