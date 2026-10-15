const { getLanguageId, submitBatch } = require("../utils/ProblemUtility");
const { Problem } = require("../models/problem");
const User=require("../models/user");
const Submission = require("../models/submission");
const createProblem = async (req, res) => {
  const { referenceSolution, visibleTestcases } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      const submissions = visibleTestcases.map((testcase) => ({
        language: languageId,
        source_code: completeCode,
        stdin: testcase.input,
      }));

      const testResult = await submitBatch(submissions); 

      console.log(testResult);

      for (let i = 0; i < testResult.length; i++) {
      const actual = (testResult[i].stdout || "").trim();
        
        const expected = visibleTestcases[i].output.trim();

        if (actual !== expected) {
          return res
            .status(400)
            .send(`${language} Reference Solution Failed Testcase ${i + 1}`);
        }
      }
    }

    await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Created Successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};
const updateProblem = async (req, res) => {
  const { id } = req.params;
  const { referenceSolution, visibleTestcases } = req.body;

  try {
    if(!id){
      return res.status(400).send("Misssing Id")
    }
    const que=await Problem.findById(id);
    if(!que){
      return res.status(404).send("Invalid Id")
      
    }
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageId(language);

      const submissions = visibleTestcases.map((testcase) => ({
        language: languageId,
        source_code: completeCode,
        stdin: testcase.input,
      }));

      const testResult = await submitBatch(submissions);

      console.log(testResult);

      for (let i = 0; i < testResult.length; i++) {
        const actual = testResult[i].stdout.trim();
        const expected = visibleTestcases[i].output.trim();

        if (actual !== expected) {
          return res
            .status(400)
            .send(`${language} Reference Solution Failed Testcase ${i + 1}`);
        }
      }
    }
    const updatedQue = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true})
    res.status(201).send(updatedQue);
  } catch (err) {
    res.status(404).send("Error: " + err);
  }
};
const deleteProblem=async(req,res)=>{
  const {id}=req.params;

  try{
    if(!id){
      return res.status(400).send("Misssing Id")
    }
    const que=await Problem.findById(id);
    if(!que){
      return res.status(404).send("Problem not found")
      
    }
    const deletedQues=await Problem.findByIdAndDelete(id)
    res.status(200).send("sucessfully Deleted")
  }catch(err){
       res.status(404).send("Error: " + err);
  }
}
const getProblemById=async(req,res)=>{
    const {id}=req.params;
    try{
      if(!id){
      return res.status(400).send("Misssing Id")
    }
    
    const que=await Problem.findById(id).select("_id title description difficulty visibleTestcases startCode referenceSolution");
    if(!que){
      return res.status(404).send("Problem not found")
    }
    res.status(201).send(que)
    }catch(err){
      res.status(500).send("Error: "+err)
    }
}
const getAllProblem=async(req,res)=>{
    try{
      
    
    const Allque=await Problem.find({}).select("_id title difficulty tags");
    if(Allque.length===0){
      return res.status(404).send("Problem not found")
    }
    res.status(201).send(Allque)
    }catch(err){
      res.status(500).send("Error: "+err)
    }
}

const problemAllSolvedByUser=async(req,res)=>{
  try{
      const user =await User.findById(req.result._id).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });

      //const problemSolved=req.result.populate("problemSolved");
      res.status(201).send(user.problemSolved)
  }catch(err){
    res.status(500).send("Error: "+err);
  }
}

const submittedProblem=async(req,res)=>{
  try{
    const userId =req.result._id
    const problemId=req.params.pid;
    const ans=await Submission.find({userId,problemId})
    if(ans.length===0){
      res.status(200).send("No submissions")
    }
    res.status(200).send(ans)
  }catch(err){
    res.status(500).send("Error: "+err);
  }
}
module.exports = { createProblem, updateProblem,deleteProblem,getProblemById,getAllProblem,problemAllSolvedByUser,submittedProblem};
