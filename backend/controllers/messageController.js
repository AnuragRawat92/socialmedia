import Chat from "../models/chatModel.js";
import Messages from "../models/Message.js";
import { getReciverSocketId, io } from "../socket/socket.js";
import Trycatch from "../utils/Trycatc.js";

export const sendMessage=Trycatch(async(req ,res)=>{
    const {recieverId ,message}=req.body
    const senderId=req.user._id
    if(! recieverId){
        return res.status(400).json({
            message:"Please give receiver id"
        })
    }
    let chat =await Chat.findOne({
        users:{$all:[senderId,recieverId]},
    });
    if(!chat){
        chat=new Chat({
        users:[senderId,recieverId],
        latestMessage:{
            text:message,
            sender:senderId,
        },
        });
        await chat.save()
        }
        const newMessage=new Messages({
            chatId:chat._id,
            sender:senderId,
            text:message,
        })
        await newMessage.save()
        await chat.updateOne({
            latestMessage:{
                text:message,
                sender:senderId,
            },
        })
        const recieverSocketId=getReciverSocketId(recieverId)
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage)
        }
        res.status(201).json(newMessage)
});
export const getAllMessages=Trycatch(async(req,res)=>{
    const {id}=req.params;
    const userId=req.user._id;
    const chat=await Chat.findOne({
        users:{
            $all:[userId ,id]
        }
    })
    if(! chat){
        return res.status(400).json({
            message:"No chat with user"
        })
    }
     const messages= await Messages.find({
        chatId:chat._id
     })
     res.json(messages)
})
export const getAllchats=Trycatch(async(req,res)=>{
    const chats=await Chat.find({
        users:req.user._id
}).populate("users", "name profilepic")
chats.forEach((e)=>{
    e.users=e.users.filter(
       (user)=>user._id.toString()!==req.user._id.toString()
    )
})
    res.json(chats)
})