const express=require("express")
require('dotenv').config()
const cookieParser=require("cookie-parser")
const main=require("./config/db")
const User=require('./models/user')
const authRouter=require("./routes/userAuth")
const problemRouter=require("./routes/problemCRUD")
const submitRouter=require("./routes/submit")
const redisClient=require("./config/redis")
const cors=require("cors")
const app=express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser());

app.use("/user",authRouter);
app.use("/problem",problemRouter)
app.use("/submission",submitRouter);
const intializeConnection=async()=>{
    try{
        await Promise.all[main(),redisClient.connect()]
        console.log("db connected")
        app.listen(process.env.PORT,()=>{
            console.log("listening at port number"+process.env.PORT)
        })
    }
    catch(err){
        console.log("Error: "+err.message)
    }
}
intializeConnection()
