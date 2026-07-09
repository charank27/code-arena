require("dotenv").config()
const redisClient = require("../config/redis");
const User=require("../models/user")
const jwt=require("jsonwebtoken")
const adminMiddleware=async(req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            throw new Error("Tokens are not present")
        }
        const payload=jwt.verify(token,process.env.JWTKEY)
        const {_id}=payload;
        if(!_id){
            throw new Error("ID are not present")
        }
        const result=await User.findById(_id)
        if(payload.role != 'admin'){
            throw new Error("Invalid token")
        }
        if(!result){
             throw new Error("User not present")
        }
        const isBloked=await redisClient.exists(`token:${token}`)
        if(isBloked){
            throw new Error("Invalid token")
        }
        req.result=result;
        next();
    }catch(err){
        res.status(400).send("Error: "+err.message)
    }
}
module.exports=adminMiddleware