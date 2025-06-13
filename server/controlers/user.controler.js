import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { sendInvitationEmail } from "./mailjet.controler.js";

export const createUser = catchAsync(async (req, res, next) => {
  try {
    const {
      email,
      name,
      last_name,
      allow_validate_exam,
      allow_handle_users,
    } = req.body;

    // Validate required fields
    if (!name) {
      throw commonErrors.missingFields(["name"]);
    }
    
    if (!email) {
      throw commonErrors.missingFields(["email"]);
    }

    // Validate name length
    if (name.trim().length < 2) {
      throw commonErrors.invalidInput("Username must be at least 2 characters");
    }
    
    if (name.trim().length > 50) {
      throw commonErrors.invalidInput("Username must be less than 50 characters");
    }
    
    // Validate last name if provided
    if (last_name && last_name.trim().length > 50) {
      throw commonErrors.invalidInput("Last name must be less than 50 characters");
    }
    
    // Validate email format
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      throw commonErrors.invalidInput("Please enter a valid email address");
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw commonErrors.alreadyExists("User");
    }
    
    // Create the user (always in pending status, no password)
    const user = await User.create({
      name,
      last_name,
      allow_validate_exam: allow_validate_exam || false,
      allow_handle_users: allow_handle_users || false,
      email,
      status: "pending",
    });

    try {
      // Create invitation token after user is created
      const invitationToken = jwt.sign(
        {
          email: user.email,
          userId: user.id,
          purpose: "invitation",
        },
        JWT_SECRET,
        { expiresIn: "48h" }
      );
      
      
      await sendInvitationEmail(
        { name: user.name, email: user.email },
        invitationToken,
        "http://localhost:3000/"
      );
      
      res.status(201).json({
        status: "success",
        message: "User created successfully and invitation sent",
        data: {
          user: user.toJSON(),
        },
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);

      res.status(201).json({
        status: "success",
        message: "User created successfully but invitation email failed to send",
        data: {
          user: user.toJSON(),
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

export const getUsers = catchAsync(async (req, res, next) => {
  try {
    const {users, totalCount } = await User.findUsers(req.query);


    res.status(200).json({
      status: "success",
      data: {
        users,
        totalCount,
      },
    });

  } catch (error) {
    next(error);
  }
});

export const findUserById = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const blockUser = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    await User.updateById(req.params.id, { status: "bloqueado" });
    res.status(200).json({
      status: "success",
      message: "Usuario eliminado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const updateUser = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    await User.updateById(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Usuario actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
});


