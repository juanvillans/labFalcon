import { catchAsync, commonErrors } from "../middlewares/error.middleware.js";
import origin from "../models/origin.model.js";

export const getOrigins = catchAsync(async (req, res, next) => {
  try {
    const origins = await origin.getAll();
    res.status(200).json({
      status: "success",
      data: {
        origins,
      },
    });
  } catch (error) {
    next(error);
  }
});
