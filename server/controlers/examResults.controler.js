import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_SECRET } from "../config/env.js";
import { db } from "../database/postgre.js";
import { sendResultsEmail } from "./mailjet.controler.js";
import { APP_URL } from "../config/env.js";

// Generate secure token for exam results
export const generateResultsToken = (analysisId, patientEmail) => {
  const payload = {
    analysisId,
    email: patientEmail,
    type: 'exam_results',
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
  };

  return jwt.sign(payload, JWT_SECRET);
};

// Generate token endpoint (for WhatsApp links)
export const generateToken = catchAsync(async (req, res, next) => {
  try {
    const { analysisId } = req.body;

    // Get analysis data
    const analysis = await db("analysis").where("id", analysisId).first();
    if (!analysis) {
      throw commonErrors.notFound("Analysis");
    }

    // Generate secure token
    const token = generateResultsToken(analysisId, analysis.email);

    res.status(200).json({
      status: "success",
      data: {
        token: token,
        analysisId: analysisId
      }
    });
  } catch (error) {
    next(error);
  }
});

// Function to update message status (internal use)
export const updateMessageStatus = async (analysisId, status) => {
  try {
    await db("analysis")
      .where("id", analysisId)
      .update({ 
        message_status: status,
        updated_at: db.fn.now()
      });
    return true;
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
};

// HTTP endpoint wrapper for updating message status
export const updateMessageStatusEndpoint = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['NO_ENVIADO', 'ENVIADO', 'LEIDO'];
    if (!validStatuses.includes(status)) {
      throw commonErrors.badRequest("Estado inválido");
    }

    // Use the internal function
    await updateMessageStatus(id, status);

    res.status(200).json({
      status: "success",
      message: "Estado actualizado exitosamente",
      data: {
        analysisId: id,
        message_status: status
      }
    });
  } catch (error) {
    next(error);
  }
});

// Send results email with secure link
export const sendExamResults = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.body;

    const analysis = await db("analysis").where("id", id).first();
    if (!analysis) {
      throw commonErrors.notFound("Analysis");
    }

    const token = generateResultsToken(id, analysis.email);
    const resultsUrl = `${APP_URL}/results/${token}`;
    
    // Send email
    await sendResultsEmail({
      to: analysis.email,
      patientName: `${analysis.first_name} ${analysis.last_name}`,
      resultsUrl: resultsUrl,
      labName: "Laboratorio Falcón"
    });

    // Update status after successful send
    await updateMessageStatus(id, 'ENVIADO');

    res.status(200).json({
      status: "success",
      message: "Resultados enviados por email exitosamente",
      data: {
        email: analysis.email,
        message_status: 'ENVIADO'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get exam results by token (PUBLIC ROUTE)
export const getExamResultsByToken = catchAsync(async (req, res, next) => {
  console.log("getExamResultsByToken");
  try {
    const { token } = req.params;

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      throw commonErrors.unauthorized("Token inválido o expirado");
    }

    // Validate token type
    if (decoded.type !== 'exam_results') {
      throw commonErrors.unauthorized("Token inválido");
    }

    const { analysisId } = decoded;

    // Get analysis data
    const analysis = await db("analysis")
      .select(
        "*",
        db.raw("to_char(date_birth, 'YYYY-MM-DD') as date_birth"),
        db.raw("to_char(created_at, 'YYYY-MM-DD') as created_date"),
        db.raw("to_char(created_at, 'HH12:MI AM') as created_time")
      )
      .where("id", analysisId)
      .first();

    if (!analysis) {
      throw commonErrors.notFound("Resultados no encontrados");
    }
    // Get exams data
    const examsData = await db("analysis_exams")
      .join("exams", "analysis_exams.id_exam", "exams.id")
      .join("examination_types", "exams.examination_type_id", "examination_types.id")
      .where("analysis_exams.analysis_id", analysisId)
      .select(
        "exams.*",
        "examination_types.name as examination_type_name"
      );

    // Helper function for JSON parsing
    const safeJsonParse = (jsonString) => {
      try {
        if (typeof jsonString === 'object' && jsonString !== null) {
          return jsonString;
        }
        if (typeof jsonString === 'string') {
          return JSON.parse(jsonString);
        }
        return {};
      } catch (error) {
        console.error('JSON parse error:', error);
        return {};
      }
    };

    // Calculate age
    const calculateAge = (dateOfBirth) => {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

    // Format response
    const result = {
      id: analysis.id,
      patient: {
        ci: analysis.ci,
        first_name: analysis.first_name,
        last_name: analysis.last_name,
        date_birth: analysis.date_birth,
        email: analysis.email,
        phone_number: analysis.phone_number,
        address: analysis.address,
        sex: analysis.sex,
      },
      all_validated: analysis.all_validated,
      created_date: analysis.created_date,
      created_time: analysis.created_time,
      age: calculateAge(analysis.date_birth),
      tests: examsData.reduce((acc, exam) => {
        acc[exam.examination_type_id] = {
          testValues: safeJsonParse(exam.tests_values),
          testTypeName: exam.examination_type_name,
          testTypeId: exam.examination_type_id,
          validated: exam.validated
        };
        return acc;
      }, {})
    };

    console.log({result});
    res.status(200).json({
      status: "success",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Download PDF results by token (PUBLIC ROUTE)
export const downloadExamResultsPDF = catchAsync(async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify token (same as above)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      throw commonErrors.unauthorized("Token inválido o expirado");
    }

    if (decoded.type !== 'exam_results') {
      throw commonErrors.unauthorized("Token inválido");
    }

    // Get exam data (reuse logic from above)
    // ... (implement PDF generation logic here)
    
    // For now, return success message
    res.status(200).json({
      status: "success",
      message: "PDF generation not implemented yet",
      data: {
        analysisId: decoded.analysisId
      }
    });
  } catch (error) {
    next(error);
  }
});
