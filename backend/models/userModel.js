import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:["male","female"]
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
],
    followings:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
],
profilepic:{
    id:String,
    url:String,
},
},{
    timestamps:true
});
 const User =mongoose.model("User",userSchema)
 export default User