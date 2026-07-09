const express=require("express")
const submitRouter=express.Router();
const submitCodeRateLimitter=require("../middleware/ratelimitter") 
const userMiddleware=require("../middleware/userMiddleware")
const {submitCode,runCode}=require("../controllers/userSubmission")
submitRouter.post("/run/:id",userMiddleware,runCode)
submitRouter.post("/submit/:id",userMiddleware,submitCodeRateLimitter,submitCode)
module.exports=submitRouter;