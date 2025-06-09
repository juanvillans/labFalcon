import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";


export const signIn = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw commonErrors.missingFields(['email', 'password']);
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw commonErrors.notFound("Usuario");
    }

    // Check if account is pending activation (stop here if true)
    console.log(user)
    if (user.status === "pendiente") {
      throw commonErrors.invalidInput("Cuenta pendiente de activación");
    }
    
    // Only validate password if user is active
    // Check if user has a password set
    if (!user.password) {
      throw commonErrors.invalidInput("Usuario no tiene contraseña configurada");
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw commonErrors.invalidInput("Contraseña incorrecta");
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, pourpose: "login" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      message: "Usuario autenticado con éxito",
      data: {
        token,
        user: user.toJSON(), // Excludes password
      },

    });
    
  } catch (error) {
    next(error);
  }
});

export const signOut = catchAsync(async (req, res, next) => {
  try {

    res.status(200).json({
      status: "success",
      message: "Cerrar sesión",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyInvitationToken = catchAsync(async(req, res, next) => {
  try {
    // The token has already been validated by middleware
    // Just return the user info
    res.status(200).json({
      status: "success",
      message: "Token de invitación válido",
      data: {
        user: {
          name: req.tokenUser.name,
          email: req.tokenUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export const activateAccount = catchAsync(async(req, res, next) => {
  try {
     const { password } = req.body;
     if (!password) {
      throw commonErrors.missingFields(['password']);
     }
 
     // Hash the password
     const salt = await bcrypt.genSalt(12);
     const hashedPassword = await bcrypt.hash(password, salt);
     
     // Update user
     const user = await User.updateById(req.tokenUser.id, {
       password: hashedPassword,
       status: "activo"
     });
     
     res.status(200).json({
       status: "success",
       message: "Cuenta activada con éxito",
       data: {
         user: user.toJSON()
       }
     });

  } catch (error) {
    next(error)
  }
})
