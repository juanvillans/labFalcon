import { Router } from "express";
import { createExam, getExams, findExamById, updateExam, deleteExam, validateExam, getChartData } from "../controlers/exams.controler.js";
import { generateToken, sendExamResults, updateMessageStatusEndpoint } from "../controlers/examResults.controler.js";
import { protect, requireValidateExam } from "../middlewares/auth.middleware.js";

const examsRouter = Router();

examsRouter.get("/", protect, getExams);
// Mover las rutas específicas ANTES de las rutas con parámetros
examsRouter.get("/chart-data/:period", protect, getChartData);
examsRouter.post("/generate-results-token", protect, generateToken);
examsRouter.post("/send-results", protect, sendExamResults);
examsRouter.put("/update-message-status/:id", protect, updateMessageStatusEndpoint);
examsRouter.put("/validate-exam", protect, requireValidateExam, validateExam);
examsRouter.post("/", protect, createExam);

// Las rutas con parámetros van AL FINAL
examsRouter.get("/:id", protect, findExamById);
examsRouter.put("/:id", protect, updateExam);
examsRouter.delete("/:id", protect, deleteExam);

export default examsRouter;
