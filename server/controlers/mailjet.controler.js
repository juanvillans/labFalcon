import transporter from "../config/mailjet.js";
import { MAIL_FROM_ADDRESS, MAIL_FROM_NAME } from "../config/env.js";

// Generic email sending function
export const sendMail = function(mailOptions) {
    return new Promise((resolve, reject) => {
        // Ensure recipient email is properly formatted
        if (mailOptions.to && typeof mailOptions.to === 'string') {
            // Validate email format
            if (!isValidEmail(mailOptions.to)) {
                return reject(new Error(`Invalid email format: ${mailOptions.to}`));
            }
        }
        
        // Create complete mail options with sender
        const completeOptions = {
            from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
            ...mailOptions
        };
        
        transporter.sendMail(completeOptions, function(error, info) {
            if (error) {
                console.log("Email error:", error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info);
            }
        });
    });
};

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const sendInvitationEmail = function (recipient, invitationToken, frontendUrl) {
    const activationLink = `${frontendUrl}/activate-account?token=${invitationToken}`;
    
    const mailOptions = {
        to: recipient.email,
        subject: "Bienvenido a labFalcón - Activa tu cuenta",
        html: `
            <h3>Bienvenido a nuestra plataforma, ${recipient.name}!</h3>
            <p>Tu cuenta ha sido creada. Por favor haz clic en el enlace a continuación para establecer tu contraseña y activar tu cuenta:</p>
            <p><a href="${activationLink}">Activar cuenta</a></p>
            <p>Este enlace caducará en 48 horas. Si no activas tu cuenta antes de que expire el enlace, se eliminará tu usuario.</p>
            <p>Si no solicitaste esta cuenta, por favor ignora este correo electrónico.</p>
        `
    };
    
    return sendMail(mailOptions);
}

export const sendPasswordResetEmail = function (recipient, resetToken, frontendUrl) {
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        to: recipient.email,
        subject: "Password Reset Request",
        html: `
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password. Please click the link below to set a new password:</p>
            <p><a href="${resetLink}">Reset Your Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        `
    };
    
    return sendMail(mailOptions);
}

export default {
    sendMail,
    sendInvitationEmail,
    sendPasswordResetEmail
};
