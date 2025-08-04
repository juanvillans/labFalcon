
import { db } from "../database/postgre.js";

class AnalysisExams {
  constructor(data) {
    this.id = data.id || null;
    this.analysis_id = data.analysis_id;
    this.id_exam = data.id_exam;
  }

  static async createWithTransaction(trx,  analysis_exams_ids) {
    try {
      // Handle both single examId and array of analysis_exams_ids
      const idsArray = Array.isArray(analysis_exams_ids) ? analysis_exams_ids : [analysis_exams_ids];

      // Insert all records at once using transaction
      const analysisExams = await trx("analysis_exams")
        .insert(analysis_exams_ids)
        .returning("*");

      // Return array of AnalysisExams instances
      return analysisExams.map(record => new AnalysisExams(record));
    } catch (error) {
      throw error;
    }
  }

  static async deleteByAnalysisIdWithTransaction(trx, analysisId) {
    try {
      // Get existing exam IDs before deleting relationships
      const existingAnalysisExams = await trx("analysis_exams")
        .where("analysis_id", analysisId)
        .select("id_exam");

      const existingExamIds = existingAnalysisExams.map(ae => ae.id_exam);

      // Delete analysis_exams relationships
      await trx("analysis_exams")
        .where("analysis_id", analysisId)
        .del();

      return existingExamIds;
    } catch (error) {
      throw error;
    }
  }

  static async deleteByAnalysisId(analysisId) {
    try {
      // Get existing exam IDs before deleting relationships
      const existingAnalysisExams = await db("analysis_exams")
        .where("analysis_id", analysisId)
        .select("id_exam");

      const existingExamIds = existingAnalysisExams.map(ae => ae.id_exam);

      // Delete analysis_exams relationships
      await db("analysis_exams")
        .where("analysis_id", analysisId)
        .del();

      return existingExamIds;
    } catch (error) {
      throw error;
    }
  }
}

export default AnalysisExams;
