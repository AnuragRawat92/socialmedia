import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { followAndUnfollowUser, getAllUser, myProfile, upadtePassword, updateProfile,  userFollowerandFollowingData, userProfile } from '../controllers/userController.js';
import uploadFile from '../middlewares/multer.js';
const router=express.Router();
router.get('/me',isAuth,myProfile)
router.get('/all',isAuth,getAllUser)
router.get("/:id",isAuth,userProfile)
router.post("/follow/:id",isAuth,followAndUnfollowUser)
router.get("/followdata/:id",isAuth, userFollowerandFollowingData)
router.put("/:id",isAuth, uploadFile ,updateProfile)
router.post("/:id",isAuth,upadtePassword)

export default router