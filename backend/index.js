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
import cors from "cors";

// Allow your frontend domain explicitly

const url = `https://socialmedia-1-bcju.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log(
        `Reloaded at ${new Date().toISOString()}: Status Code ${
          response.status
        }`
      );
    })
    .catch((error) => {
      console.error(
        `Error reloading at ${new Date().toISOString()}:`,
        error.message
      );
    });
}

setInterval(reloadWebsite, interval);
dotenv.config()
cloudinary.v2.config({
    cloud_name:process.env.Cloudinary_Cloud_Name,
    api_key:process.env.Cloudinary_API,
    api_secret:process.env.Cloudinary_Secret,
})
// const app=express()
app.use(cookieParser())


app.use(express.json())
const port = process.env.PORT || 7000;
app.use(cors({
  origin:  "https://socialmedia-1-bcju.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/post",postRoutes)
app.use("/api/messages",messageRoute)

const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectdb();
});
