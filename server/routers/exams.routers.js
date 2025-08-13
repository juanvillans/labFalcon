import { Router } from "express";
import { createExam, getExams, findExamById, updateExam, deleteExam, validateExam } from "../controlers/exams.controler.js";
import { generateToken, sendExamResults, updateMessageStatusEndpoint } from "../controlers/examResults.controler.js";
import { protect, requireValidateExam } from "../middlewares/auth.middleware.js";

const examsRouter = Router();

examsRouter.get("/", protect, getExams);
examsRouter.get("/:id", protect, findExamById);
examsRouter.post("/", protect, createExam);
examsRouter.put("/:id", protect, updateExam);
examsRouter.delete("/:id", protect, deleteExam);
examsRouter.put("/validate-exam", protect, requireValidateExam, validateExam);
examsRouter.post("/generate-results-token", protect, generateToken);
examsRouter.post("/send-results", protect, sendExamResults);
examsRouter.put("/update-message-status/:id", protect, updateMessageStatusEndpoint);

export default examsRouter;
