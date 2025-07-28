
import { db } from "../database/postgre.js";

class AnalysisExams {
  constructor(data) {
    this.id = data.id || null;
    this.analysis_id = data.analysis_id;
    this.id_exams= data.id_exams;
  }

  static async create(analysisId, examId) {
    try {
      const [analysisExam] = await db("analysis_exams")
        .insert({
          analysis_id: analysisId,
          id_exam: examId,
        })
        .returning("*");

      return new AnalysisExams(analysisExam);
    } catch (error) {
      throw error;
    }
  }
}

export default AnalysisExams;