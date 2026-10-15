const express=require("express")
const userMiddleware=require("../middleware/userMiddleware")
const adminMiddleware=require("../middleware/adminMiddleware")
const authRouter=express.Router();
const {register,login,logout,adminRegister,deleteProfile}=require("../controllers/userauther")
//registration
authRouter.post('/register',register);
//login
authRouter.post("/login",login)
//logout
authRouter.post("/logout",userMiddleware,logout)
//fetchaccount
//authRouter.post("/fetchaccount",userMiddleware,fetchAccount)
//admin login
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile)
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    res.status(201).json({
        user:reply,
        message:"valid user"
    })
})
module.exports=authRouter