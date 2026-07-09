const redisClient=require("../config/redis")
const submitCodeRateLimitter=async(req,res,next)=>{
    const userId=req.result._id;
    const redisKey=`submit_cooldown:${userId}`;
    try{
        const exists=await redisClient.exists(redisKey);
        if(exists){
            return res.status(429).json({
                error:"please wait for 10 seconds before submitting"
            })
        }
        await redisClient.set(redisKey,'cooldown_active',{
            EX:10,
            NX:true
        })
        next();
    }catch(err){
console.log("rate Limmiter error ",err);
res.status(500).json({
    error:"internal server error"
})
    }
}
module.exports=submitCodeRateLimitter;