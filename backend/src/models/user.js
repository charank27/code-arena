const mongoose=require("mongoose");
const { Problem } = require("./problem");
const {Schema} =mongoose;
const userSchema=new Schema({
    firstName:{
        type:String,
        minLength:3,
        maxLength:10,
        required:true
    },
    LastName:{
        type:String,
        minLength:3,
        maxLength:10
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        immutable:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        min:6,
        max:80
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
    }
},{timestamps:true})
const User=mongoose.model("user",userSchema)
module.exports=User;