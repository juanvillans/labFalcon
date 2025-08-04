import { Router } from "express";
import { createExam, getExams, findExamById, updateExam, deleteExam, validateExam, generateResultsToken, sendResultsEmail } from "../controlers/exams.controler.js";
import { protect, requireValidateExam } from "../middlewares/auth.middleware.js";

const examsRouter = Router();

examsRouter.get("/", protect, getExams);
examsRouter.get("/:id", protect, findExamById);
examsRouter.post("/", protect, createExam);
examsRouter.put("/:id", protect, updateExam);
examsRouter.delete("/:id", protect, deleteExam);
examsRouter.put("/validate-exam", protect, requireValidateExam, validateExam);
examsRouter.post("/generate-results-token", protect, generateResultsToken);
examsRouter.post("/send-results", protect, sendResultsEmail);

export default examsRouter;