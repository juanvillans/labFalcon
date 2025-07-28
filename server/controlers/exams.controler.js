import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { sendInvitationEmail } from "./mailjet.controler.js";
import Analysis from "../models/analysis.model.js";
import Exams from "../models/exams.model.js"; 
import AnalysisExams from "../models/analysis_exams.model.js";

export const createExam = catchAsync(async (req, res, next) => {
  try {
    const {
      patient,
      tests,
      allValidated,
    } = req.body;


    // Validate required fields
    if (!patient.ci) {
      throw commonErrors.missingFields(["Cédula de Identidad"]);
    }
    
    if (!patient.last_name) {
      throw commonErrors.missingFields(["Apellido"]);
    }
    
    if (!patient.first_name) {
      throw commonErrors.missingFields(["Nombre"]);
    }
    
    if (!patient.date_birth) {
      throw commonErrors.missingFields(["Fecha de Nacimiento"]);
    }
    
    if (! testTypeId) {
      throw commonErrors.missingFields(["Tipo de examen"]);
    }
    
    
    // Create the exam
    const analysis = await Analysis.create({
      patient,
      
      allValidated,
    });
    const analysisId = analysis.id;
    const exmasIdArray = [];
    for (const testKey in tests) {
      const test = tests[testKey];
      const exam = await Exams.create({test_values: test.testValues, testTypeId: test.testTypeId, validated: test.validated})
      exmasIdArray.push(exam.id);
    }

    await AnalysisExams.create(analysisId, exmasIdArray);
    res.status(201).json({
      status: "success",
      message: "Examen creado con éxito",
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const getExams = catchAsync(async (req, res, next) => {
  try {
    const exams = await Exam.getAll();
    const totalCount = exams.length;

    // Helper to calculate age from date of birth
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

    // Add age to each exam
    const examsWithAge = exams.map((exam) => ({
      ...exam,
      age: calculateAge(exam.date_birth), // Assumes `date_birth` exists in each exam
    }));

    res.status(200).json({
      status: "success",
      data: {
        exams: examsWithAge,
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const findExamById = catchAsync(async (req, res, next) => {
  try {
    console.log(req.params.id);
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw commonErrors.notFound("Exam");
    }
    res.status(200).json({
      status: "success",
      data: {
        exam,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const updateExam = catchAsync(async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw commonErrors.notFound("Exam");
    }
    await Exam.update(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Examen actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const deleteExam = catchAsync(async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      throw commonErrors.notFound("Exam");
    }
    await Exam.delete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Examen eliminado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const validateExam = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw commonErrors.missingFields(["id"]);
    }
    await Exam.updateById(id, { allValidated: true });
    res.status(200).json({
      status: "success",
      message: "Examen validado con éxito",
    });
  } catch (error) {
    next(error);
  }
});
