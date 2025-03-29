import mongoose  from "mongoose";
 export const connectdb=async()=>{
    try{
await mongoose.connect(process.env.MONGO_URL,{
    dbName:"SocialMedia",
});
console.log("Connected to mongodb")
    }
    catch(error){
        console.log(error)
    }
 }