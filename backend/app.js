import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dbConnection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
// var morgan = require('morgan')
import morgan from "morgan"
import bookRoute from './routes/bookRoute.js'
import userRoute from './routes/userRoute.js'
import  translateAliases  from "./routes/transactionRoute.js";

const app = express();
dotenv.config({ path: "./config/config.env" });
app.use(
  cors({
    origin: "*", // Allows access from any origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan('dev'))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/book", bookRoute)
app.use("/api/v1/user", userRoute)
app.use("/api/v1/bookrent", translateAliases)


dbConnection();
app.use(errorMiddleware);

export default app;