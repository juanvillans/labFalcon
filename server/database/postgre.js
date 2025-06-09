import pg from "pg";
import { NODE_ENV } from "../config/env.js";

const { Pool } = pg;

// Get PostgreSQL connection details from environment variables
const {
  POSTGRES_URL,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_USER = "postgres",
  POSTGRES_PORT = 5432,
} = process.env;

// Create connection pool
const pool = new Pool({
  connectionString: POSTGRES_URL,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: POSTGRES_DATABASE,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
async function connectToDB() {
  try {
    const client = await pool.connect();
    console.log(`✅ Connected to PostgreSQL database: ${POSTGRES_DATABASE}`);

    // Create tables if they don't exist
    await createTables(client);

    client.release();
    return pool;
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error.message);
    throw error;
  }
}

// Create necessary tables
async function createTables(client) {
  try {
    // Create users table
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 2),
                email VARCHAR(255) UNIQUE NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                allow_validate_exam BOOLEAN DEFAULT FALSE,
                allow_handle_users BOOLEAN DEFAULT FALSE,
                password VARCHAR(255),
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) 
        `);

    // Create index on email for faster lookups
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        `);

    console.log("✅ Database tables created/verified successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    throw error;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Closing PostgreSQL connection pool...");
  await pool.end();
  console.log("✅ PostgreSQL connection pool closed");
  process.exit(0);
});

export default connectToDB;
export { pool };
