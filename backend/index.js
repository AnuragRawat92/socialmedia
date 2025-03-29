import express from 'express'
import dotenv from 'dotenv'
import { connectdb } from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import cloudinary  from 'cloudinary'
import cookieParser from 'cookie-parser'
import messageRoute from "./routes/messageRoute.js"
import {app,server} from "./socket/socket.js"
import path from "path";

import axios from 'axios';
dotenv.config()
cloudinary.v2.config({
    cloud_name:process.env.Cloudinary_Cloud_Name,
    api_key:process.env.Cloudinary_API,
    api_secret:process.env.Cloudinary_Secret,
})
// const app=express()
app.use(cookieParser())


app.use(express.json())

const port=7000||process.env.port
app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/post",postRoutes)
app.use("/api/messages",messageRoute)

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectdb();
});