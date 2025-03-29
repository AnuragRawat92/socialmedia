import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js';
import Trycatch from '../utils/Trycatc.js';
import getDataUrl from '../utils/urlGenerator.js';
import bcrypt from 'bcryptjs'
import cloudinary  from 'cloudinary'
export const registeruser=async(req ,res)=>{
    try{
const{name,email,password,gender}=req.body
const file=req.file;
if(!name||!email||!password||!gender||!file){
    return res.status(400).json({
        message:"Please give all values",
    });
}
let user=await User.findOne({email})
if(user){
    return res.status(400).json({
        message:"User already registered"
    })
}
const fileUrl=getDataUrl(file)
const hashPassword=await  bcrypt.hash(password,10)
const myCloud =await cloudinary.v2.uploader.upload(fileUrl.content)
user=await User.create({
    name,
    email,
    password:hashPassword,
    gender,
    profilepic:{
        id:myCloud.public_id,
        url:myCloud.secure_url,
    }
})
generateToken(user._id,res)
res.status(201).json({
message:"User Registered",
user
})
    }
    catch(error){
        console.log(error)
    }
}
// login controller
export const loginUser=Trycatch(async(req,res)=>{
    const {email,password}=req.body
    const user =await User.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"Invalid Credentials"
        })
    }
    const comparePassword=await bcrypt.compare(password,user.password)
    if(! comparePassword){
        return res.status(400).json({
            message:"Invalid Credentials"
        })
    }
    generateToken(user._id,res);
    res.json({
        message:"User logged in",
        user,
    })
})
//logout
export const logoutUser=Trycatch((req,res)=>{
    res.cookie("token","",{maxAge:0})
    res.json({
        message:"Logged out successfully"
    })
})