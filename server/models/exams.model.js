import { db } from "../database/postgre.js";

class Exam {
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
    this.examination_type_id = data.examination_type_id;
    this.test_values = data.test_values; // Ensure this is included
    this.examination_type_name = data.examination_type_name; // From join
    this.validated = data.validated;
    this.updated_at = data.updated_at;
    this.created_at = data.created_at;
    
    // Add virtual fields (not stored in DB)
    this.created_date = new Date(data.created_at).toISOString().split('T')[0]; // "2025-07-02"
    this.created_time = new Date(data.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }); // "3:36 PM"
  
  }

  static async create(examData) {
    try {
      // First, verify the examination type exists
      const examType = await db("examination_types")
        .where({ id: examData.testTypeId })
        .first();
      
      if (!examType) {
        throw new Error("Examination type not found");
      }

      const [exam] = await db("exams")
        .insert({
          ci: examData.patient.ci,
          last_name: examData.patient.last_name,
          first_name: examData.patient.first_name,
          date_birth: examData.patient.date_birth,
          email: examData.patient.email,
          phone_number: examData.patient.phone_number,
          address: examData.patient.address,
          sex: examData.patient.sex,
          examination_type_id: examData.testTypeId,
          test_values: JSON.stringify(examData.testsValues),
          validated: examData.validated || false,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning("*");

      return new Exam({ ...exam, testTypeName: examType.name });
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

    return exams.map((exam) => new Exam(exam));
  }

  static async findById(id) {
    const exam = await db("exams").where("id", id).first();

    return exam ? new Exam(exam) : null;
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
  
    if (updateData.validated !== undefined)
      updates.validated = updateData.validated;
  
    if (updateData.testTypeId !== undefined)
      updates.examination_type_id = updateData.testTypeId;
  
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
}

export default Exam;