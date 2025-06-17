 import { Router } from "express";
import { getExaminationTypes } from "../controlers/examination_types.controler.js";
import { protect } from "../middlewares/auth.middleware.js";

const examsTypesRouter = Router();

examsTypesRouter.get("/", protect, getExaminationTypes);

export default examsTypesRouter;