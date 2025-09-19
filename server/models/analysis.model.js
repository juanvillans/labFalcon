import { db } from "../database/postgre.js";

class Analysis {
  constructor(data) {
    const patientData = data.patient || data;
    this.id = data.id || null;
    this.ci = patientData.ci;
    this.last_name = patientData.last_name;
    this.first_name = patientData.first_name;
    this.date_birth = patientData.date_birth;
    this.email = patientData.email;
    this.phone_number = patientData.phone_number;
    this.address = patientData.address;
    this.sex = patientData.sex;
    this.all_validated = data.all_validated;
    this.updated_at = data.updated_at;
    this.created_at = data.created_at;

    // Add virtual fields (not stored in DB)
    this.created_date = new Date(data.created_at).toISOString().split("T")[0]; // "2025-07-02"
    this.created_time = new Date(data.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }); // "3:36 PM"
  }

  static async createWithTransaction(trx, examData) {
    try {
      const [analysis] = await trx("analysis")
        .insert({
          ci: examData.patient.ci,
          last_name: examData.patient.last_name,
          first_name: examData.patient.first_name,
          date_birth: examData.patient.date_birth,
          email: examData.patient.email,
          phone_number: examData.patient.phone_number,
          address: examData.patient.address,
          sex: examData.patient.sex,
          origin_id: examData.patient.origin_id,
          all_validated: examData.all_validated,
        })
        .returning("*");

      return new Analysis({ ...analysis, patient: examData.patient });
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Exam with this CI already exists");
      } else if (error.code === "23503") {
        throw new Error("Invalid examination type ID");
      }
      throw error;
    }
  }

  static async findById(id) {
    const exam = await db("analysis").where("id", id).first();

    return exam ? new Analysis(exam) : null;
  }

  static async update(id, updateData) {
    const updates = {};

    // Flatten patient info if present
    if (updateData.patient) {
      const {
        ci,
        first_name,
        last_name,
        date_birth,
        email,
        phone_number,
        address,
        sex,
      } = updateData.patient;

      updates.ci = ci;
      updates.first_name = first_name;
      updates.last_name = last_name;
      updates.date_birth = date_birth;
      updates.email = email;
      updates.phone_number = phone_number;
      updates.address = address;
      updates.sex = sex;
    }

    // Handle direct updates
    if (updateData.testsValues !== undefined)
      updates.test_values = JSON.stringify(updateData.testsValues);

    if (updateData.all_validated !== undefined)
      updates.all_validated = updateData.all_validated;

    if (updateData.testTypeId !== undefined)
      updates.examination_type_id = updateData.testTypeId;

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update");
    }

    updates.updated_at = db.fn.now();

    try {
      const [updatedExam] = await db("analysis")
        .where("id", id)
        .update(updates)
        .returning("*");

      return new Analysis(updatedExam);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db("exams").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error("Failed to delete exam");
    }
  }

  static async getChartDataByPeriod(period) {
    let query = db("analysis");
    const today = new Date();

    switch (period) {
      case "today":
        query.where("created_at", ">=", new Date(today.setHours(0, 0, 0, 0)));
        break;
      case "this_week":
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        startOfWeek.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfWeek);
        break;
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfMonth);
        break;
      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfYear);
        break;
      default:
        throw new Error("Invalid period specified");
    }

    // Single query approach - more efficient
    const result = await query
      .select(
        db.raw("COUNT(DISTINCT ci) as total_patients"),
        db.raw(
          "COUNT(CASE WHEN message_status = 'ENVIADO' AND all_validated = true THEN 1 END) as message_sent"
        ),
        db.raw(
          "COUNT(CASE WHEN message_status = 'NO_ENVIADO' AND all_validated = true THEN 1 END) as message_not_sent"
        ),
        db.raw(
          "COUNT(CASE WHEN message_status = 'LEIDO' AND all_validated = true THEN 1 END) as message_read"
        )
      )
      .first();

    return result;
  }
}

export default Analysis;
