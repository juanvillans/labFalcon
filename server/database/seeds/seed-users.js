import dotenv from "dotenv";
import bcrypt from "bcryptjs";


// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" 
  ? ".env.production" 
  : ".env.development.local";

dotenv.config({ path: envFile });

const usersSeed = [
    {
      first_name: "Admin Juan",
      last_name: "Villasmil",
      email: "juanvillans16@gmail.com",
      password: "123456",
      allow_validate_exam: true,
      allow_handle_users: true,
      allow_handle_exams: true,
      status: "activo",
    },
 
  ];

  export async function seed(knex) {
    const count = await knex('users').count('id');
    if (parseInt(count[0].count) > 0) {
      console.log("users already exist. Seeding skipped.");
      return;
    }
  
    for (const user of usersSeed) {
      const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);
      await knex('users').insert({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: hashedPassword,
        allow_validate_exam: user.allow_validate_exam,
        allow_handle_users: user.allow_handle_users,
        allow_handle_exams: user.allow_handle_exams,
        status: user.status,
      });
      console.log(`Seeded: ${user.first_name} ${user.last_name}`);
    }
  }
  
