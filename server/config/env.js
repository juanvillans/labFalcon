import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load from project root always
dotenv.config({
  path: path.resolve(__dirname, '../.env.development.local')
});
export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  MAIL_MAILER,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_ENCRYPTION,
  MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME,
  POSTGRES_URL,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PORT,
  APP_URL,
  CLIENT_URL, // Agregar esta nueva variable
} = process.env;
 
// Validate critical environment variables
if (!JWT_SECRET && NODE_ENV !== 'migration') {
  throw new Error("JWT_SECRET environment variable is required but not set");
}

if (!DB_URI && NODE_ENV !== 'migration') {
  throw new Error("DB_URI environment variable is required but not set");
}
