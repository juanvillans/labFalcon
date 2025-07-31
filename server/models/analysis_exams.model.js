
import { db } from "../database/postgre.js";

class AnalysisExams {
  constructor(data) {
    this.id = data.id || null;
    this.analysis_id = data.analysis_id;
    this.id_exam = data.id_exam;
  }

  static async createWithTransaction(trx, analysisId, examIds) {
    try {
      // Handle both single examId and array of examIds
      const idsArray = Array.isArray(examIds) ? examIds : [examIds];
      
      // Create array of objects to insert
      const insertData = idsArray.map(examId => ({
        analysis_id: analysisId,
        id_exam: examId,
      }));

      // Insert all records at once using transaction
      const analysisExams = await trx("analysis_exams")
        .insert(insertData)
        .returning("*");

      // Return array of AnalysisExams instances
      return analysisExams.map(record => new AnalysisExams(record));
    } catch (error) {
      throw error;
    }
  }
}

export default AnalysisExams;
