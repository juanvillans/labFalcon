import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { sendInvitationEmail } from "./mailjet.controler.js";
import Exam from "../models/exams.model.js";

export const createExam = catchAsync(async (req, res, next) => {
  try {
    const {
      patient,
      testsValues,
      testTypeId,
      testTypeName,
      validated,
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
    
    if (testTypeId) {
      throw commonErrors.missingFields(["Tipo de examen"]);
    }
    
    
    // Create the exam
    const exam = await Exam.create({
      patient,
      testsValues,
      testTypeId,
      testTypeName,
      validated,
    });
    
    res.status(201).json({
      status: "success",
      message: "Examen creado con éxito",
      data: {
        exam,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const getExams = catchAsync(async (req, res, next) => {
  try {
    const exams = await Exam.getAllExams();
    const totalCount = exams.length;

    res.status(200).json({
      status: "success",
      data: {
        exams,
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const findExamById = catchAsync(async (req, res, next) => {
  try {
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
    await Exam.updateById(req.params.id, req.body);
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
    await Exam.deleteById(req.params.id);
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
    await Exam.updateById(id, { validated: true });
    res.status(200).json({
      status: "success",
      message: "Examen validado con éxito",
    });
  } catch (error) {
    next(error);
  }
});
