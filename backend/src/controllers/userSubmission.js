const { Problem } = require("../models/problem");
const Submission = require("../models/submission");
const {
    getLanguageId,
    submitBatch
} = require("../utils/ProblemUtility");

const runCode=async(req,res)=>{
   try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send("some field is missing");
    }

    const problem = await Problem.findById(problemId);
    
    //submit code to compilerAPI
    const languageId = getLanguageId(language);
    const submissions = problem.visibleTestcases.map((testcase) => ({
      language: languageId,
      source_code: code,
      stdin: testcase.input,
    }));

    const testResult = await submitBatch(submissions);
    

res.status(201).send(testResult);
  } catch (err) {
    res.status(500).send("Internal server error: "+err)
  }
}
const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;
    if (!userId || !problemId || !code || !language) {
      return res.status(400).send("some field is missing");
    }

    const problem = await Problem.findById(problemId);
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      status: "pending",
      testCasesTotal: problem.hiddenTestcases.length,
    });
    //submit code to compilerAPI
    const languageId = getLanguageId(language);
    const submissions = problem.hiddenTestcases.map((testcase) => ({
      language: languageId,
      source_code: code,
      stdin: testcase.input,
    }));

    const testResult = await submitBatch(submissions);
    //we get output and compare output with our expected_output
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = "";
    for (let i = 0; i < testResult.length; i++) {

    const result = testResult[i];

    runtime = Math.max(runtime, result.executionTime || 0);
    memory = Math.max(memory, result.memoryUsed || 0);

    // API Error
    if (result.status === "failed") {
        status = "error";
        errorMessage = result.error;
        break;
    }

    // Compilation Error
    if (result.stderr) {
        status = "error";
        errorMessage = result.stderr;
        break;
    }

    // Runtime Error
    if (result.exception) {
        status = "error";
        errorMessage = result.exception;
        break;
    }

    const actual = (result.stdout || "").trim();
    const expected = problem.hiddenTestcases[i].output.trim();

    if (actual === expected) {
        testCasesPassed++;
    } else {
        status = "wrong";
    }
}

submittedResult.status=status;
submittedResult.testCasesPassed=testCasesPassed;
submittedResult.errorMessage=errorMessage;
submittedResult.runtime=runtime;
submittedResult.memory=memory;
await submittedResult.save();
//save this problem to user schema in problemsolved
if( status === "accepted" &&
    !req.result.problemSolved.some(id => id.toString() === problemId)){
  req.result.problemSolved.push(problemId);
  await req.result.save();
}
res.status(201).send(submittedResult);
  } catch (err) {
    res.status(500).send("Internal server error: "+err)
  }
};
module.exports = {submitCode,runCode};

//how test result look
// [
//   {
//     status: "success",
//     exception: null,
//     stdout: "5",
//     stderr: null,
//     compilationTime: 687,
//     executionTime: 2,
//     memoryUsed: 4608,
//     stdin: "2 3"
//   },
//   {
//     status: "success",
//     exception: null,
//     stdout: "30",
//     stderr: null,
//     compilationTime: 677,
//     executionTime: 2,
//     memoryUsed: 4716,
//     stdin: "10 20"
//   }
// ]
