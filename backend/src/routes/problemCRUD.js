const express=require("express")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,problemAllSolvedByUser,submittedProblem}=require("../controllers/userProblem")
const userMiddleware=require("../middleware/userMiddleware")
const adminMiddleware=require("../middleware/adminMiddleware")
const problemRouter=express.Router();
//admin only
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);
//any one
problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware,problemAllSolvedByUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem)
module.exports=problemRouter;