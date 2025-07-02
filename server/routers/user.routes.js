import { Router } from "express";
import { createUser, getUsers, findUserById, blockUser, updateUser } from "../controlers/user.controler.js";
import { protect, requireHandleUsers } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.get("/", protect, requireHandleUsers, getUsers);
userRouter.get("/:id", protect, requireHandleUsers, findUserById);
userRouter.post("/", protect, requireHandleUsers, createUser);

userRouter.put("/block-user",protect, requireHandleUsers, blockUser);
userRouter.put("/:id",protect, requireHandleUsers, updateUser);

export default userRouter