import { Router } from "express";
import { createUser, findAllUsers, findUserById } from "../controlers/user.controler.js";
import { protect, requireHandleUsers } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.get("/", protect, requireHandleUsers, findAllUsers);
userRouter.get("/:id", protect, requireHandleUsers, findUserById);
userRouter.post("/", protect, requireHandleUsers, createUser);
userRouter.put("/:id", (req, res) => { res.send({ title: "update user" })});
userRouter.delete("/:id", (req, res) => { res.send({ title: "delete user" })});

export default userRouter
