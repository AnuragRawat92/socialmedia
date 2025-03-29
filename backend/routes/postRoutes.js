import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { commentOnPost, deleteComment, deletePost, editCaption, getAllPost, likeUnlikePost, newPost } from '../controllers/postControllers.js';
import uploadFile from '../middlewares/multer.js';
const router=express.Router();
router.post("/new",isAuth, uploadFile,newPost)
router.delete("/:id",isAuth,deletePost)
router.get('/all',isAuth,getAllPost)
router.post("/like/:id",isAuth,likeUnlikePost)
router.post("/comment/:id",isAuth,commentOnPost)
router.delete("/comment/:id",isAuth,deleteComment)
router.put("/:id",isAuth,editCaption)
export default router