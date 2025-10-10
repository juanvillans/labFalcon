 import { db } from "../database/postgre.js";

class ExaminationType {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.tests = data.tests;
  }

  static async getAllExaminationTypes() {
    const examinationTypes = await db("examination_types").select("*").orderBy("id", "asc"); // Add this line;
    return examinationTypes.map((examinationType) => new ExaminationType(examinationType));
  }
}

export default ExaminationType;