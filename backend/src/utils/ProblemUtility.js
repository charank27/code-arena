const axios = require("axios");
require("dotenv").config();
const getLanguageId = (lang) => {
  const langlist = {
    "c++": "cpp",
    java: "java",
    javascript: "javascript",
  };

  return langlist[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      language: submissions[0].language,
      stdin: submissions.map((sub) => sub.stdin),
      files: [
        {
          name:
            submissions[0].language === "cpp"
              ? "main.cpp"
              : submissions[0].language === "java"
              ? "Main.java"
              : "index.js",
          content: submissions[0].source_code,
        },
      ],
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.log(err.response?.data || err.message);
    throw err;
  }
};

module.exports = {
  getLanguageId,
  submitBatch,
};