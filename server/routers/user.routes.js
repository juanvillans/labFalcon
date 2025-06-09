import { Router } from "express";
import { createUser, findAllUsers, findUserById, blockUser, updateUser } from "../controlers/user.controler.js";
import { protect, requireHandleUsers } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.get("/", protect, requireHandleUsers, findAllUsers);
userRouter.get("/:id", protect, requireHandleUsers, findUserById);
userRouter.post("/", protect, requireHandleUsers, createUser);

userRouter.put("/block-user",protect, requireHandleUsers, blockUser);
userRouter.put("/update-user",protect, requireHandleUsers, updateUser);

export default userRouter