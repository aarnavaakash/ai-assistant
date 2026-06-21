import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"

const app=express()
app.use(cors({
    origin: (origin, callback) => {
        // We add your exact frontend URL here, while keeping the localhost check for local testing
        if (!origin || origin === 'https://ai-assistant-frontend-q4tp.onrender.com' || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))
const port=process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)



app.listen(port,()=>{
    connectDb()
    console.log("server started")
})
