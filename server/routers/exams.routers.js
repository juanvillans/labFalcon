import { Router } from "express";
import { createExam, getExams, getExamById, updateExam, deleteExam } from "../controlers/exams.controler.js";
import { protect, requireValidateExam } from "../middlewares/auth.middleware.js";

const examsRouter = Router();

examsRouter.get("/", protect, getExams);
examsRouter.get("/:id", protect, getExamById);
examsRouter.post("/", protect, createExam);
examsRouter.put("/:id", protect, updateExam);
examsRouter.delete("/:id", protect, deleteExam);
examsRouter.put("/validate-exam", protect, requireValidateExam, validateExam);

export default examsRouter;