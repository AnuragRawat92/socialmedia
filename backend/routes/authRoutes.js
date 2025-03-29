import express from 'express'
import { loginUser, logoutUser, registeruser } from '../controllers/authControllers.js';
import uploadFile from '../middlewares/multer.js';
const router=express.Router();
router.post("/register",uploadFile, registeruser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
export default router