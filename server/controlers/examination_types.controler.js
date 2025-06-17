 import { db } from "../database/postgre.js";
import { catchAsync, commonErrors } from "../middlewares/error.middleware.js";
import examination_types from "../models/examination_types.model.js";

export const getExaminationTypes = catchAsync(async (req, res, next) => {
  try {
    const examinationTypes = await examination_types.getAllExaminationTypes();
    res.status(200).json({
      status: "success",
      data: {
        examinationTypes,
      },
    });
  } catch (error) {
    next(error);
  }
});
