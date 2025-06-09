import express from "express"
import {PORT} from "./config/env.js"

import userRouter from "./routers/user.routes.js"
import authRouter from "./routers/auth.routes.js"
import connectToDB from "./database/postgre.js"
import errorHandler, { notFound } from "./middlewares/error.middleware.js"
import arcjetMiddleware from "./middlewares/arcjet.middleware.js"

const app = express()

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use(arcjetMiddleware)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.get("/", (req, res) => {
    res.send( "welcome to the Subscription")
})

// Handle undefined routes (404 errors)
app.all('*', notFound)

// Global error handling middleware (must be last)
app.use(errorHandler)

app.listen(PORT, async () => {
    console.log("Subscription tracker Api is running in port " + PORT);
    await connectToDB()
}) 

export default app

