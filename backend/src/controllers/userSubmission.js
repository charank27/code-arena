const { Problem } = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {
    getLanguageId,
    submitBatch
} = require("../utils/ProblemUtility");

const runCode = async (req, res) => {
    // 
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        let { code, language } = req.body;
        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("some field is missing");
        }

        // (cpp to c++)
        if (language === 'cpp') language = 'c++';

        // Fetch the problem from database
        const problem = await Problem.findById(problemId);
        // testcases(Hidden)
        if (!problem) {
            return res.status(404).send("Problem not found");
        }

        // Check if visibleTestcases exists
        if (!problem.visibleTestcases || problem.visibleTestcases.length === 0) {
            return res.status(400).send("No visible test cases found for this problem");
        }

        //submit code to compilerAPI
        const languageId = getLanguageId(language);
        const submissions = problem.visibleTestcases.map((testcase) => ({
            language: languageId,
            source_code: code,
            stdin: testcase.input,
        }));

        const testResult = await submitBatch(submissions);

        // Format the response with detailed test case results
        let allPassed = true;
        let runtime = 0;
        let memory = 0;
        let errorMessage = null;

        const formattedResults = testResult.map((result, index) => {
            const expectedOutput = problem.visibleTestcases[index].output.trim();
            const actualOutput = (result.stdout || "").trim();
            
            let passed = false;
            let status = "success";
            let error = null;

            // API Error
            if (result.status === "failed") {
                status = "failed";
                error = result.error || "API Error";
                allPassed = false;
                errorMessage = error;
            }
            // Compilation Error
            else if (result.stderr) {
                status = "error";
                error = result.stderr;
                allPassed = false;
                errorMessage = error;
            }
            // Runtime Error
            else if (result.exception) {
                status = "error";
                error = result.exception;
                allPassed = false;
                errorMessage = error;
            }
            // Check if output matches
            else if (result.status === "success") {
                if (actualOutput === expectedOutput) {
                    passed = true;
                } else {
                    allPassed = false;
                    error = `Expected: "${expectedOutput}", Got: "${actualOutput}"`;
                    errorMessage = error;
                }
            }

            // Track runtime and memory
            runtime = Math.max(runtime, result.executionTime || 0);
            memory = Math.max(memory, result.memoryUsed || 0);

            return {
                testCase: index + 1,
                input: problem.visibleTestcases[index].input,
                expectedOutput: expectedOutput,
                actualOutput: actualOutput || null,
                passed: passed,
                status: status,
                executionTime: result.executionTime || 0,
                memoryUsed: result.memoryUsed || 0,
                error: error,
                stderr: result.stderr || null,
                exception: result.exception || null,
                stdout: result.stdout || null
            };
        });

        res.status(201).json({
            success: allPassed,
            testCases: formattedResults,
            runtime: runtime,
            memory: memory,
            errorMessage: errorMessage,
            summary: {
                total: formattedResults.length,
                passed: formattedResults.filter(r => r.passed).length,
                failed: formattedResults.filter(r => !r.passed).length
            }
        });

    } catch (err) {
        console.error("Run code error:", err);
        res.status(500).send("Internal server error: " + err.message)
    }
}

const submitCode = async (req, res) => {
    // 
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        let { code, language } = req.body;
        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("some field is missing");
        }

       //(cpp to c++)
        if (language === 'cpp') language = 'c++';

        //console.log('Language:', language);

        //    Fetch the problem from database
        const problem = await Problem.findById(problemId);
        //    testcases(Hidden)
        if (!problem) {
            return res.status(404).send("Problem not found");
        }

        // Check if hiddenTestcases exists
        if (!problem.hiddenTestcases || problem.hiddenTestcases.length === 0) {
            return res.status(400).send("No hidden test cases found for this problem");
        }

        console.log('Hidden test cases:', problem.hiddenTestcases.length);

        
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
            const expectedOutput = problem.hiddenTestcases[i].output.trim();

            runtime = Math.max(runtime, result.executionTime || 0);
            memory = Math.max(memory, result.memoryUsed || 0);

            // API Error
            if (result.status === "failed") {
                status = "error";
                errorMessage = result.error || "API Error";
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
                errorMessage = `Test case ${i + 1} failed. Expected: "${expected}", Got: "${actual}"`;
                // Continue checking other test cases
            }
        }

        // Store the result in Database in Submission
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        //save this problem to user schema in problemsolved
        if (status === "accepted" &&
            !req.result.problemSolved.some(id => id.toString() === problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        const accepted = (status === 'accepted');
        res.status(201).json({
            accepted: accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime: runtime,
            memory: memory,
            status: status,
            errorMessage: errorMessage,
            submissionId: submittedResult._id
        });

    } catch (err) {
        console.error("Submission error:", err);
        res.status(500).send("Internal server error: " + err.message)
    }
};

module.exports = { submitCode, runCode };

//how test result look (OneCompiler API Response)
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