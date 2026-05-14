import express from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import { userRoute } from './APIs/userAPI.js'
import { authorRoute } from './APIs/authorAPI.js'
import { adminRoute } from './APIs/adminAPI.js'
import cookieParser from 'cookie-parser'
import { commonRouter } from './APIs/commonAPI.js'
import cors from 'cors'


config()//process .env

const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true,
    credentials: true
}))

//Add body parser middleware
app.use(express.json())
app.use(cookieParser())

//connect APIs
app.use('/user-api', userRoute)
app.use('/author-api', authorRoute)
app.use('/admin-api', adminRoute)
app.use('/common-api', commonRouter)

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: "Blog App API is running..." });
})

// Connect to Database
const connectDB = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("DB connection success")
    } catch (err) {
        console.log("Err in DB connection", err)
    }
}

connectDB()

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server started in port ${port}`))

//dealing with invalid paths
app.use((req, res, next) => {
    res.json({ message: "Invalid path" });
})

//error handeling middleware
app.use((err, req, res, next) => {

    // mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    // mongoose cast error
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        const value = keyValue[field];
        return res.status(409).json({
            message: "error occurred",
            error: `${field} "${value}" already exists`,
        });
    }

    // ✅ HANDLE CUSTOM ERRORS
    if (err.status) {
        return res.status(err.status).json({
            message: "error occurred",
            error: err.message,
        });
    }

    // default server error
    res.status(500).json({
        message: "error occurred",
        error: "Server side error",
    });
});
