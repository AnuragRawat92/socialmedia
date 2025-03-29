import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { getAllchats, getAllMessages, sendMessage } from "../controllers/messageController.js"
const router=express.Router()
router.post("/",isAuth,sendMessage)
router.get("/chats",isAuth,getAllchats)
router.get("/:id",isAuth,getAllMessages)
router.get("/chats",isAuth,getAllchats)
export default router