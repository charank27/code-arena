const redisClient = require("../config/redis")
const User=require("../models/user")
const Submission=require("../models/submission")
const validate=require("../utils/validator")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
require("dotenv").config()
const register=async(req,res)=>{
    try{
        //vlidate pass email
        validate(req.body)
        const {firstName,emailId,password}=req.body;
        //hashing the pssword
        req.body.password=await bcrypt.hash(password,10)
        req.body.role='user';
        const user=await User.create(req.body)
        const token=jwt.sign({_id:user._id, emailId:emailId},process.env.JWTKEY,{expiresIn:3600})
        const reply={
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id
        }
        res.cookie("token",token,{maxAge:3600*1000}) //in millisec
        
        res.status(201).json({
            user:reply,
            message:"Logged in sucessfully"
        });

    }catch(err){
        res.status(400).send("Error: "+err.message)
    }
}
const login=async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        if(!emailId || !password){
            throw new Error("invalid credentials")
        }
        const user=await User.findOne({emailId})
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const match=bcrypt.compare(password,user.password)
        if(!match){
             throw new Error("invalid credentials")
        }
        const token=jwt.sign({_id:user._id, emailId:emailId,role:user.role},process.env.JWTKEY,{expiresIn:3600})
        const reply={
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id
        }
        res.cookie("token",token,{maxAge:3600*1000})
        res.status(201).json({
            user:reply,
            message:"Logged in sucessfully"
        });

    }catch(err){
        res.status(401).send("Error: "+err.message)
    }
}
const logout=async(req,res)=>{
    try{

        //validate token
        const {token}=req.cookies;
        const payload=jwt.decode(token)
        await redisClient.set(`token:${token}`,"bloked")
        await redisClient.expireAt(`token:${token}`,payload.exp)
        res.cookie("token",null,{expires:new Date(Date.now())})
        res.send("Logged out sucessfully")
    }catch(err){
        res.status(503).send("Error: "+err.message)
    }
}
const adminRegister=async(req,res)=>{
    try{
        //vlidate pass email
        validate(req.body)
        const {firstName,emailId,password}=req.body;
        //hashing the pssword
        req.body.password=await bcrypt.hash(password,10)
        req.body.role='admin';
        const user=await User.create(req.body)
        const token=jwt.sign({_id:user._id, emailId:emailId,role:user.role},process.env.JWTKEY,{expiresIn:3600})
        res.cookie("token",token,{maxAge:3600*1000}) //in millisec
        res.status(201).send("User registered sucessfully")

    }catch(err){
        res.status(400).send("Error: "+err.message)
    }
}
const deleteProfile=async(req,res)=>{
    try{
        const userId=req.result._id;
        //del from user schema
        await User.findByIdAndDelete(userId)
        //del submission schem
        await Submission.deleteMany({userId})
        res.status(200).send("Profile deleted sucessfully")
    }catch(err){
        res.status(500).send("Error: "+err.message)
    }
}

module.exports={register,login,logout,adminRegister,deleteProfile}