import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [error, setError] = useState(null);
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  // Language mapping for frontend->backend
  const getLanguageForBackend = (lang) => {
    const map = {
      javascript: "javascript",
      java: "java",
      cpp: "c++",
    };
    return map[lang] || lang;
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching problem with ID:", problemId);

        const response = await axiosClient.get(
          `/problem/getProblemById/${problemId}`,
        );

        console.log("=== Problem Data Debug ===");
        console.log(response.data);
        console.log(response.data.problem);
        console.log("Full response:", response.data);
        console.log("Problem title:", response.data.title);
        console.log("Problem description:", response.data.description);
        console.log("StartCode:", response.data.startCode);
        console.log("==========================");

        // Map backend language names to frontend language identifiers
        const langMap = {
          "C++": "cpp",
          Java: "java",
          Javascript: "javascript",
          JavaScript: "javascript",
        };

        let initialCode = "// Write your solution here";

        if (response.data.startCode && response.data.startCode.length > 0) {
          const codeObj = response.data.startCode.find(
            (sc) =>
              sc.language.toLowerCase() === selectedLanguage.toLowerCase(),
          );
          if (codeObj) {
            initialCode =
              codeObj.intialCode ||
              codeObj.initialCode ||
              "// Write your solution here";
            console.log(
              "Found code for language:",
              selectedLanguage,
              initialCode,
            );
          } else {
            console.log("No code found for language:", selectedLanguage);
            // Fallback to first available language
            const firstCode = response.data.startCode[0];
            if (firstCode) {
              initialCode =
                firstCode.intialCode ||
                firstCode.initialCode ||
                "// Write your solution here";
              console.log(
                "Using first available code from:",
                firstCode.language,
              );
            }
          }
        }

        setProblem(response.data);
        setCode(initialCode);
        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching problem:", error);
        setError(
          error.response?.data || error.message || "Failed to load problem",
        );
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    } else {
      setError("No problem ID provided");
      setLoading(false);
    }
  }, [problemId, selectedLanguage]);

  // Update code when language changes
useEffect(() => {
  if (!problem) return;

  let initialCode = "// Write your solution here";

  const codeObj = problem.startCode?.find(
    (sc) =>
      sc.language.toLowerCase() ===
      getLanguageForBackend(selectedLanguage).toLowerCase()
  );

  if (codeObj) {
    initialCode =
      codeObj.intialCode ||
      codeObj.initialCode ||
      "// Write your solution here";
  }

  setCode(initialCode);
}, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const languageForBackend = getLanguageForBackend(selectedLanguage);
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: languageForBackend,
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: error.response?.data || "Internal server error",
      });
      setLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const languageForBackend = getLanguageForBackend(selectedLanguage);
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          code: code,
          language: languageForBackend,
        },
      );

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult({
        accepted: false,
        status: "error",
        errorMessage: error.response?.data || "Failed to submit",
      });
      setLoading(false);
      setActiveRightTab("result");
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      default:
        return "javascript";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error max-w-2xl">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Failed to load problem!</h3>
              <div className="text-sm">{error}</div>
              <div className="text-xs mt-2 text-gray-400">
                Problem ID: {problemId}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${activeLeftTab === "description" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("description")}
          >
            Description
          </button>
          <button
            className={`tab ${activeLeftTab === "editorial" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("editorial")}
          >
            Editorial
          </button>
          <button
            className={`tab ${activeLeftTab === "solutions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("solutions")}
          >
            Solutions
          </button>
          <button
            className={`tab ${activeLeftTab === "submissions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("submissions")}
          >
            Submissions
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === "description" && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">
                      {problem.title || "Problem Title"}
                    </h1>
                    {problem.difficulty && (
                      <div
                        className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}
                      >
                        {problem.difficulty.charAt(0).toUpperCase() +
                          problem.difficulty.slice(1)}
                      </div>
                    )}
                    {problem.tags && (
                      <div className="badge badge-primary">{problem.tags}</div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    {problem.description ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {problem.description}
                      </div>
                    ) : (
                      <div className="text-gray-500 p-4 bg-base-200 rounded-lg">
                        <p>No description available for this problem.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {problem.visibleTestcases &&
                      problem.visibleTestcases.length > 0 ? (
                        problem.visibleTestcases.map((example, index) => (
                          <div
                            key={index}
                            className="bg-base-200 p-4 rounded-lg"
                          >
                            <h4 className="font-semibold mb-2">
                              Example {index + 1}:
                            </h4>
                            <div className="space-y-2 text-sm font-mono">
                              <div>
                                <strong>Input:</strong> {example.input}
                              </div>
                              <div>
                                <strong>Output:</strong> {example.output}
                              </div>
                              {example.explanation && (
                                <div>
                                  <strong>Explanation:</strong>{" "}
                                  {example.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">
                          No examples available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === "editorial" && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    Editorial is coming soon.
                  </div>
                </div>
              )}

              {activeLeftTab === "solutions" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution &&
                    problem.referenceSolution.length > 0 ? (
                      problem.referenceSolution.map((solution, index) => (
                        <div
                          key={index}
                          className="border border-base-300 rounded-lg"
                        >
                          <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">
                              {solution.language} Solution
                            </h3>
                          </div>
                          <div className="p-4">
                            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                              <code>{solution.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        Solutions will be available after you solve the problem.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === "submissions" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-gray-500">
                    Your submission history will appear here.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${activeRightTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("code")}
          >
            Code
          </button>
          <button
            className={`tab ${activeRightTab === "testcase" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("testcase")}
          >
            Testcase
          </button>
          <button
            className={`tab ${activeRightTab === "result" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("result")}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === "code" && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {["javascript", "java", "cpp"].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === "cpp"
                        ? "C++"
                        : lang === "javascript"
                          ? "JavaScript"
                          : "Java"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: "line",
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab("testcase")}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${loading ? "loading" : ""}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === "testcase" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div
                  className={`alert ${runResult.success ? "alert-success" : "alert-error"} mb-4`}
                >
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">
                          Runtime: {runResult.runtime} sec
                        </p>
                        <p className="text-sm">Memory: {runResult.memory} KB</p>

                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded text-xs"
                            >
                              <div className="font-mono">
                                <div>
                                  <strong>Input:</strong> {tc.input}
                                </div>
                                <div>
                                  <strong>Expected:</strong> {tc.expectedOutput}
                                </div>
                                <div>
                                  <strong>Output:</strong>{" "}
                                  {tc.actualOutput || "No output"}
                                </div>
                                <div className="text-green-600">✓ Passed</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">❌ Some tests failed</h4>
                        {runResult.errorMessage && (
                          <p className="text-sm mt-2 text-red-600">
                            {runResult.errorMessage}
                          </p>
                        )}

                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded text-xs"
                            >
                              <div className="font-mono">
                                <div>
                                  <strong>Input:</strong> {tc.input}
                                </div>
                                <div>
                                  <strong>Expected:</strong> {tc.expectedOutput}
                                </div>
                                <div>
                                  <strong>Output:</strong>{" "}
                                  {tc.actualOutput || "No output"}
                                </div>
                                <div
                                  className={
                                    tc.passed
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {tc.passed ? "✓ Passed" : "✗ Failed"}
                                </div>
                                {tc.error && (
                                  <div className="text-red-500 mt-1">
                                    <strong>Error:</strong> {tc.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === "result" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div
                  className={`alert ${submitResult.accepted ? "alert-success" : "alert-error"}`}
                >
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>
                            Test Cases Passed: {submitResult.passedTestCases}/
                            {submitResult.totalTestCases}
                          </p>
                          <p>Runtime: {submitResult.runtime} sec</p>
                          <p>Memory: {submitResult.memory} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">
                          ❌ {submitResult.status || "Failed"}
                        </h4>
                        {submitResult.errorMessage && (
                          <p className="mt-2 text-sm">
                            {submitResult.errorMessage}
                          </p>
                        )}
                        <div className="mt-4 space-y-2">
                          <p>
                            Test Cases Passed:{" "}
                            {submitResult.passedTestCases || 0}/
                            {submitResult.totalTestCases || 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
