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
          age: examData.age,
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

  static async updateWithTransaction(trx, id, updateData) {
    const { patient, all_validated } = updateData;
    const updates = {
        ci: patient.ci,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_birth: patient.date_birth,
        email: patient.email,
        phone_number: patient.phone_number,
        address: patient.address,
        sex: patient.sex,
        all_validated: all_validated,
        origin_id: patient.origin_id,
        age: updateData.age,
        updated_at: trx.fn.now()
      };
    // Flatten patient info if present
 
    // Handle direct updates
    if (updateData.all_validated !== undefined) {
      updates.all_validated = updateData.all_validated;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields to update");
    }

    updates.updated_at = trx.fn.now();

    try {
      const [updatedAnalysis] = await trx("analysis")
        .where("id", id)
        .update(updates)
        .returning("*");

      return new Analysis(updatedAnalysis);
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

  static async getChartDataByPeriod(period, start_date, end_date) {
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
      case "range":
        query.whereBetween("created_at", [start_date, end_date]);
        break;
      default:
        throw new Error("Invalid period specified");
    }

    // Get basic stats
    const basicStats = await query
      .clone()
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

    // Get age and gender distribution
    const ageGenderStats = await query
      .clone()
      .select(
        db.raw(`
          CASE 
            WHEN age BETWEEN 0 AND 1 THEN '0-1'
            WHEN age BETWEEN 2 AND 5 THEN '2-5'
            WHEN age BETWEEN 6 AND 11 THEN '6-11'
            WHEN age BETWEEN 12 AND 17 THEN '12-17'
            WHEN age BETWEEN 18 AND 29 THEN '18-29'
            WHEN age BETWEEN 30 AND 44 THEN '30-44'
            WHEN age BETWEEN 45 AND 59 THEN '45-59'
            WHEN age >= 60 THEN '60+'
            ELSE 'Unknown'
          END as age_range
        `),
        db.raw("COUNT(CASE WHEN sex = 'Masculino' THEN 1 END) as MASCULINO"),
        db.raw("COUNT(CASE WHEN sex = 'Femenino' THEN 1 END) as FEMENINO")
      )
      .groupBy('age_range');
             
      // order ageGenderStats by age_range
      ageGenderStats.sort((a, b) => {
        const ageRanges = ['0-1', '2-5', '6-11', '12-17', '18-29', '30-44', '45-59', '60+', 'Unknown'];
        return ageRanges.indexOf(a.age_range) - ageRanges.indexOf(b.age_range);
      });


    // Get results distribution (High vs Normal vs Low)
    

    return {
      ...basicStats,
      ageGenderDistribution: ageGenderStats,
    };
  }
}

export default Analysis;
