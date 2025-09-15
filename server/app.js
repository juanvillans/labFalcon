import express from "express";
import { PORT, APP_URL } from "./config/env.js";
import cors from "cors"; // Import the CORS package
import userRouter from "./routers/user.routes.js";
import authRouter from "./routers/auth.routes.js";
import connectToDB from "./database/postgre.js";
import errorHandler, { notFound } from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import examinationTypesRouter from "./routers/examamination_types.routers.js";
import examsRouter from "./routers/exams.routers.js";
import resultsRouter from "./routers/results.routers.js";

const app = express();
// Enable CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: APP_URL, // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable if using cookies/sessions
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(arcjetMiddleware);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/examination-types", examinationTypesRouter);
app.use("/api/v1/exams", examsRouter);
app.use("/api/v1/results", resultsRouter); // Public routes for exam results

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription API");
});

// Handle undefined routes (404 errors)
app.all("*", notFound);

// Global error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log("Subscription Tracker API is running on port " + PORT);
  await connectToDB();
});

export default app;