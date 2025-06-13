import { config } from "dotenv";

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envFile });

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
} = process.env;

// Validate critical environment variables
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set");
}

if (!DB_URI) {
  throw new Error("DB_URI environment variable is required but not set");
}
