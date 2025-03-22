// import React, { useEffect, useState } from "react";

// const CodeRunner = ({testcases, q}) => {
//   const [code, setCode] = useState(
//     "// Write your solution here\nfunction solution(input) {\n  // Parse the input string into an array of numbers\n  const numbers = JSON.parse(input);\n  \n  // Sum all the numbers in the array\n  let result = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    result += numbers[i];\n  }\n  \n  return result;\n}"
//   );
//   const [activeTab, setActiveTab] = useState("code"); // "code", "testCases"
//   const [testCases, setTestCases] = useState([
//     { id: 1, input: "[1, 2, 3, 4]", expectedOutput: "10", active: true },
//     { id: 2, input: "[-1, -2, 10]", expectedOutput: "7", active: true },
//   ]);

//   const [langId, setLangId] = useState(71);
//   const [output, setOutput] = useState("");
//   const [isRunning, setIsRunning] = useState(false);

//   // Function to evaluate code directly in the browser for faster testing
//   const evaluateCode = (codeToRun, input) => {
//     try {
//       // Create a function from the code string
//       const wrappedCode = `
//         ${codeToRun}
//         return solution(input);
//       `;
//       // Execute the function with the input
//       const result = new Function('input', wrappedCode)(input);
//       return { success: true, result: String(result) };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setIsRunning(true);
//       setOutput("Running tests...");
      
//       // Filter active test cases
//       const activeTestCases = testCases.filter(tc => tc.active);
      
//       if (activeTestCases.length === 0) {
//         setOutput("No active test cases to run!");
//         setIsRunning(false);
//         return;
//       }
      
//       let results = [];
      
//       // Use the user-provided code from the editor
//       const userCode = code;
      
//       // Run tests locally using the user's code
//       for (let i = 0; i < activeTestCases.length; i++) {
//         const testCase = activeTestCases[i];
//         const evaluation = evaluateCode(userCode, testCase.input);
        
//         if (evaluation.success) {
//           const status = evaluation.result === testCase.expectedOutput ? "PASSED" : "FAILED";
//           results.push({
//             id: testCase.id,
//             status,
//             expected: testCase.expectedOutput,
//             actual: evaluation.result,
//             error: ""
//           });
//         } else {
//           results.push({
//             id: testCase.id,
//             status: "ERROR",
//             expected: testCase.expectedOutput,
//             actual: "",
//             error: evaluation.error
//           });
//         }
//       }
      
//       // Format and display results
//       let outputText = "Test Results:\n\n";
//       let passCount = 0;
      
//       results.forEach(result => {
//         if (result.status === "PASSED") {
//           passCount++;
//           outputText += `Test Case ${result.id}: ✅ PASSED\n`;
//           outputText += `  Expected: ${result.expected}\n`;
//           outputText += `  Got: ${result.actual}\n\n`;
//         } else if (result.status === "FAILED") {
//           outputText += `Test Case ${result.id}: ❌ FAILED\n`;
//           outputText += `  Expected: ${result.expected}\n`;
//           outputText += `  Got: ${result.actual}\n\n`;
//         } else {
//           outputText += `Test Case ${result.id}: ❌ ERROR\n`;
//           outputText += `  ${result.error}\n\n`;
//         }
//       });
      
//       outputText += `\nSummary: ${passCount}/${results.length} tests passed`;
//       setOutput(outputText);
      
//     } catch (error) {
//       console.error(error);
//       setOutput(`Error running tests: ${error.message}`);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   // Run with Judge0 API using the user's code with appropriate wrappers
//   const runWithJudge0 = async () => {
//     try {
//       setIsRunning(true);
//       setOutput("Running tests with Judge0 API...");
      
//       // Filter active test cases
//       const activeTestCases = testCases.filter(tc => tc.active);
      
//       if (activeTestCases.length === 0) {
//         setOutput("No active test cases to run!");
//         setIsRunning(false);
//         return;
//       }
      
//       console.log("Selected language ID:", langId);
      
//       // Get the user's code from the editor
//       const userCode = code;
      
//       let results = [];
      
//       for (let i = 0; i < activeTestCases.length; i++) {
//         const testCase = activeTestCases[i];
//         setOutput(prev => prev + `\nRunning Test Case ${testCase.id}...`);
        
//         try {
//           // Create appropriate wrapper code based on the selected language
//           let wrappedCode = "";
//           let wrappedInput = testCase.input;
          
//           // JavaScript (Node.js)
//           if (langId === 63 || langId === 93 || langId === 112 || langId === 126) {
//             wrappedCode = `
// ${userCode}

// // Get input and run solution
// const input = process.stdin.readFileSync(0, 'utf8').trim();
// const output = solution(input);
// console.log(output);
// `;
//           }
//           // Python
//           else if (langId === 71 || langId === 85 || langId === 92 || langId === 123 || langId === 124) {
//             wrappedCode = `
// import json
// import sys

// ${userCode.replace(/function solution\(input\)/g, "def solution(input_str)")}

// # Read input and call solution
// input_data = input().strip()
// result = solution(input_data)
// print(result)
// `;
//           }
//           // Java
//           else if (langId === 62 || langId === 91) {
//             wrappedCode = `
// import java.util.*;

// public class Main {
//     ${userCode.replace(/function solution\(input\)/g, "public static Object solution(String input)")}
    
//     public static void main(String[] args) {
//         Scanner scanner = new Scanner(System.in);
//         String input = scanner.nextLine();
//         Object result = solution(input);
//         System.out.println(result);
//         scanner.close();
//     }
// }`;
//           }
//           // C++
//           else if (langId === 54 || langId === 76 || langId === 81 || langId === 82 || langId === 10 || langId === 1) {
//             wrappedCode = `
// #include <iostream>
// #include <string>
// #include <vector>
// #include <nlohmann/json.hpp>

// using json = nlohmann::json;

// ${userCode.replace(/function solution\(input\)/g, "int solution(std::string input)")}

// int main() {
//     std::string input;
//     std::getline(std::cin, input);
//     int result = solution(input);
//     std::cout << result << std::endl;
//     return 0;
// }`;
//           }
//           // If no specific language wrapper is defined, use the code as is
//           else {
//             wrappedCode = userCode;
//           }
          
//           // Encode the wrapped code in base64
//           const base64Code = btoa(wrappedCode);
//           const base64Input = btoa(wrappedInput);
          
//           // Submit user's code with the test case input
//           const response = await fetch(
//             "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
//                 "X-RapidAPI-Key": "fd14a2165emsh33dccf942f011e6p1a0a8ejsnc5c047d84cf0",
//               },
//               body: JSON.stringify({
//                 source_code: base64Code,
//                 language_id: langId,
//                 stdin: base64Input,
//               }),
//             }
//           );

//           const outputData = await response.json();
//           console.log("Judge0 API response for test case", testCase.id, ":", outputData);
          
//           // Process the result
//           let actualOutput = "";
//           let status = "ERROR";
//           let errorMessage = "";
          
//           if (outputData.status) {
//             if (outputData.status.id === 3) { // Status 3 means Accepted/Success
//               if (outputData.stdout) {
//                 actualOutput = atob(outputData.stdout).trim();
//                 status = actualOutput === testCase.expectedOutput.trim() ? "PASSED" : "FAILED";
//               } else {
//                 errorMessage = "No output produced but execution succeeded.";
//               }
//             } else {
//               // Handle other status codes
//               errorMessage = `Execution status: ${outputData.status.description}`;
              
//               if (outputData.compile_output) {
//                 try {
//                   errorMessage += "\nCompilation error: " + atob(outputData.compile_output);
//                 } catch (e) {
//                   errorMessage += "\nCompilation error: " + outputData.compile_output;
//                 }
//               }
              
//               if (outputData.stderr) {
//                 try {
//                   errorMessage += "\nStandard error: " + atob(outputData.stderr);
//                 } catch (e) {
//                   errorMessage += "\nStandard error: " + outputData.stderr;
//                 }
//               }
              
//               if (outputData.message) {
//                 errorMessage += "\nMessage: " + outputData.message;
//               }
//             }
//           } else {
//             errorMessage = "Unknown error: No status returned from API.";
//           }
          
//           results.push({
//             id: testCase.id,
//             status,
//             expected: testCase.expectedOutput,
//             actual: actualOutput,
//             error: errorMessage
//           });
//         } catch (error) {
//           console.error("API test case error:", error);
//           results.push({
//             id: testCase.id,
//             status: "ERROR",
//             expected: testCase.expectedOutput,
//             actual: "",
//             error: `API Error: ${error.message}`
//           });
//         }
//       }
      
//       // Format and display results
//       let outputText = "Test Results:\n\n";
//       let passCount = 0;
      
//       results.forEach(result => {
//         if (result.status === "PASSED") {
//           passCount++;
//           outputText += `Test Case ${result.id}: ✅ PASSED\n`;
//           outputText += `  Expected: ${result.expected}\n`;
//           outputText += `  Got: ${result.actual}\n\n`;
//         } else if (result.status === "FAILED") {
//           outputText += `Test Case ${result.id}: ❌ FAILED\n`;
//           outputText += `  Expected: ${result.expected}\n`;
//           outputText += `  Got: ${result.actual}\n\n`;
//         } else {
//           outputText += `Test Case ${result.id}: ❌ ERROR\n`;
//           outputText += `  ${result.error}\n\n`;
//         }
//       });
      
//       outputText += `\nSummary: ${passCount}/${results.length} tests passed`;
//       setOutput(outputText);
      
//     } catch (error) {
//       console.error("Judge0 API error:", error);
//       setOutput(`Error running tests with Judge0 API: ${error.message}`);
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const [lang, setLang] = useState([]);

//   useEffect(() => {
//     const fetchLang = async () => {
//       try {
//         const response = await fetch(
//           "https://judge0-ce.p.rapidapi.com/languages",
//           {
//             method: "GET",
//             headers: {
//               "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
//               "X-RapidAPI-Key": "5d6411b213mshe2d82efc15bbbdbp1b5b12jsn704c4a74dd9b",
//             },
//           }
//         );
//         const data = await response.json();
//         setLang(data);
//       } catch (error) {
//         console.error("Failed to fetch languages:", error);
//       }
//     };
//     fetchLang();
//   }, []);

//   const addTestCase = () => {
//     const newId =
//       testCases.length > 0 ? Math.max(...testCases.map((tc) => tc.id)) + 1 : 1;
//     setTestCases([
//       ...testCases,
//       { id: newId, input: "", expectedOutput: "", active: true },
//     ]);
//   };

//   const updateTestCase = (id, field, value) => {
//     setTestCases(
//       testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
//     );
//   };

//   const toggleTestCase = (id) => {
//     setTestCases(
//       testCases.map((tc) => (tc.id === id ? { ...tc, active: !tc.active } : tc))
//     );
//   };

//   const removeTestCase = (id) => {
//     setTestCases(testCases.filter((tc) => tc.id !== id));
//   };

//   const handleKeyDown = (e) => {
//     // Handle tab key for indentation
//     if (e.key === 'Tab') {
//       e.preventDefault(); // Prevent default tab behavior
      
//       // Get cursor position
//       const start = e.target.selectionStart;
//       const end = e.target.selectionEnd;
      
//       // Insert tab at cursor position (2 spaces)
//       const newCode = code.substring(0, start) + '  ' + code.substring(end);
//       setCode(newCode);
      
//       // Move cursor after the inserted tab
//       setTimeout(() => {
//         e.target.selectionStart = e.target.selectionEnd = start + 2;
//       }, 0);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-900 text-white overflow-auto overflow-x-hidden">
//       {/* Header with title */}
//       testcases: {q}
//       <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
//         <div className="flex gap-4">
//           <h2 className="text-lg font-semibold">Code Challenge</h2>
//           <div className="relative inline-block text-black">
//             <select
//               className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               onChange={(e) => setLangId(parseInt(e.target.value))}
//               value={langId}
//             >
//               {lang.map((l) => (
//                 <option key={l.id} value={l.id}>
//                   {l.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex space-x-2">
//           <div className="w-3 h-3 rounded-full bg-red-500"></div>
//           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//           <div className="w-3 h-3 rounded-full bg-green-500"></div>
//         </div>
//       </div>

//       {/* Tab navigation */}
//       <div className="flex border-b border-gray-700">
//         <button
//           className={`px-4 py-2 ${
//             activeTab === "code"
//               ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400"
//               : "bg-gray-900 text-gray-400 hover:bg-gray-800"
//           }`}
//           onClick={() => setActiveTab("code")}
//         >
//           Code Editor
//         </button>
//         <button
//           className={`px-4 py-2 ${
//             activeTab === "testCases"
//               ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400"
//               : "bg-gray-900 text-gray-400 hover:bg-gray-800"
//           }`}
//           onClick={() => setActiveTab("testCases")}
//         >
//           Test Cases
//         </button>
//       </div>

//       {/* Main content area */}
//       <div className="flex flex-grow flex-col">
//         {/* Code editor */}
//         {activeTab === "code" && (
//           <div className="h-full relative">
//             <textarea
//               className="w-full h-full p-3 pl-8 bg-gray-900 text-gray-200 font-mono text-sm border-none focus:outline-none resize-none"
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               onKeyDown={(e) => {
//                 handleKeyDown(e);
//                 e.stopPropagation();
//               }}
//               spellCheck="false"
//             ></textarea>
//           </div>
//         )}

//         {/* Test cases tab */}
//         {activeTab === "testCases" && (
//           <div className="flex-grow overflow-auto p-3">
//             <div className="mb-4">
//               <button
//                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
//                 onClick={addTestCase}
//               >
//                 Add Test Case
//               </button>
//             </div>

//             {testCases.map((testCase) => (
//               <div
//                 key={testCase.id}
//                 className="mb-4 bg-gray-800 rounded-md p-3"
//               >
//                 <div className="flex justify-between items-center mb-2">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={testCase.active}
//                       onChange={() => toggleTestCase(testCase.id)}
//                       className="mr-2"
//                     />
//                     <span className="font-semibold">
//                       Test Case {testCase.id}
//                     </span>
//                   </div>
//                   <button
//                     className="text-red-400 hover:text-red-300"
//                     onClick={() => removeTestCase(testCase.id)}
//                   >
//                     Remove
//                   </button>
//                 </div>
//                 <div className="mb-2">
//                   <label className="block text-sm text-gray-400 mb-1">
//                     Input
//                   </label>
//                   <textarea
//                     className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
//                     value={testCase.input}
//                     onChange={(e) =>
//                       updateTestCase(testCase.id, "input", e.target.value)
//                     }
//                     rows={2}
//                   ></textarea>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-400 mb-1">
//                     Expected Output
//                   </label>
//                   <textarea
//                     className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
//                     value={testCase.expectedOutput}
//                     onChange={(e) =>
//                       updateTestCase(
//                         testCase.id,
//                         "expectedOutput",
//                         e.target.value
//                       )
//                     }
//                     rows={2}
//                   ></textarea>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Output area */}
//       <div className="sticky bottom-0 bg-gray-800 p-3 border-t border-gray-700">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-sm text-gray-400">Output</span>
//           <div className="flex space-x-2">
//             <button
//               onClick={runWithJudge0}
//               disabled={isRunning}
//               className={`px-4 py-1 ${
//                 isRunning ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"
//               } rounded-md text-sm transition`}
//             >
//               Run with API
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={isRunning}
//               className={`px-4 py-1 ${
//                 isRunning ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
//               } rounded-md text-sm transition`}
//             >
//               Run Tests Locally
//             </button>
//           </div>
//         </div>
//         <div className="bg-gray-900 p-2 rounded-md text-sm font-mono text-gray-300 h-40 overflow-auto whitespace-pre-wrap">
//           {output || "// Test results will appear here"}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CodeRunner;


import React, { useEffect, useState } from "react";

const CodeRunner = ({testcases, q, code, setCode, setError}) => {
  // const [code, setCode] = useState(
  //   "// Write your solution here\nfunction solution(input) {\n  // Parse the input string into an array of numbers\n  const numbers = JSON.parse(input);\n  \n  // Sum all the numbers in the array\n  let result = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    result += numbers[i];\n  }\n  \n  return result;\n}"
  // );
  const [activeTab, setActiveTab] = useState("code"); // "code", "testCases"
  const [testCaseState, setTestCaseState] = useState([
    { id: 1, input: "[1, 2, 3, 4]", expectedOutput: "10", active: true },
    { id: 2, input: "[-1, -2, 10]", expectedOutput: "7", active: true },
  ]);
  // const [error, setError] = useState()

  // Use effect to set test cases if they are passed as props
  function isJSONObject(q) {
    return typeof q === 'object' && q !== null && !Array.isArray(q);
}
  useEffect(() => {
    if (q && isJSONObject(q)) {

      const qTestCases = q.testcases;
      setTestCaseState(qTestCases.map(tc => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        active: tc.active !== undefined ? tc.active : true
      })));
    }
  }, [q]);

  const [langId, setLangId] = useState(71);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Function to evaluate code directly in the browser for faster testing
  const evaluateCode = (codeToRun, input) => {
    try {
      // Create a function from the code string
      const wrappedCode = `
        ${codeToRun}
        return solution(input);
      `;
      // Execute the function with the input
      const result = new Function('input', wrappedCode)(input);
      return { success: true, result: String(result) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async () => {
    try {
      setIsRunning(true);
      setOutput("Running tests...");
      
      // Filter active test cases
      const activeTestCases = testCaseState.filter(tc => tc.active);
      
      if (activeTestCases.length === 0) {
        setOutput("No active test cases to run!");
        setIsRunning(false);
        return;
      }
      
      let results = [];
      
      // Use the user-provided code from the editor
      const userCode = code;
      
      // Run tests locally using the user's code
      for (let i = 0; i < activeTestCases.length; i++) {
        const testCase = activeTestCases[i];
        const evaluation = evaluateCode(userCode, testCase.input);
        
        if (evaluation.success) {
          const status = evaluation.result === testCase.expectedOutput ? "PASSED" : "FAILED";
          results.push({
            id: testCase.id,
            status,
            expected: testCase.expectedOutput,
            actual: evaluation.result,
            error: ""
          });
        } else {
          results.push({
            id: testCase.id,
            status: "ERROR",
            expected: testCase.expectedOutput,
            actual: "",
            error: evaluation.error
          });
        }
      }
      
      // Format and display results
      let outputText = "Test Results:\n\n";
      let passCount = 0;
      
      results.forEach(result => {
        if (result.status === "PASSED") {
          passCount++;
          outputText += `Test Case ${result.id}: ✅ PASSED\n`;
          outputText += `  Expected: ${result.expected}\n`;
          outputText += `  Got: ${result.actual}\n\n`;
        } else if (result.status === "FAILED") {
          outputText += `Test Case ${result.id}: ❌ FAILED\n`;
          outputText += `  Expected: ${result.expected}\n`;
          outputText += `  Got: ${result.actual}\n\n`;
        } else {
          outputText += `Test Case ${result.id}: ❌ ERROR\n`;
          outputText += `  ${result.error}\n\n`;
        }
      });
      
      outputText += `\nSummary: ${passCount}/${results.length} tests passed`;
      setOutput(outputText);
      
    } catch (error) {
      console.error(error);
      setOutput(`Error running tests: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run with Judge0 API using the user's code with appropriate wrappers
  const runWithJudge0 = async () => {
    try {
      setIsRunning(true);
      setOutput("Running tests with Judge0 API...");
      
      // Filter active test cases
      const activeTestCases = testCaseState.filter(tc => tc.active);
      
      if (activeTestCases.length === 0) {
        setOutput("No active test cases to run!");
        setIsRunning(false);
        return;
      }
      
      console.log("Selected language ID:", langId);
      
      // Get the user's code from the editor
      const userCode = code;
      
      let results = [];
      
      for (let i = 0; i < activeTestCases.length; i++) {
        const testCase = activeTestCases[i];
        setOutput(prev => prev + `\nRunning Test Case ${testCase.id}...`);
        
        try {
          // Create appropriate wrapper code based on the selected language
          let wrappedCode = "";
          let wrappedInput = testCase.input;
          
          // JavaScript (Node.js)
          if (langId === 63 || langId === 93 || langId === 112 || langId === 126) {
            wrappedCode = `
${userCode}

// Get input and run solution
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
const output = solution(input);
console.log(output);
`;
          }
          // Python
          else if (langId === 71 || langId === 85 || langId === 92 || langId === 123 || langId === 124) {
            wrappedCode = `
import json
import sys

${userCode.replace(/function solution\(input\)/g, "def solution(input_str)")}

# Read input and call solution
input_data = input().strip()
result = solution(input_data)
print(result)
`;
          }
          // Java
          else if (langId === 62 || langId === 91) {
            wrappedCode = `
import java.util.*;

public class Main {
    ${userCode.replace(/function solution\(input\)/g, "public static Object solution(String input)")}
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        Object result = solution(input);
        System.out.println(result);
        scanner.close();
    }
}`;
          }
          // C++
          else if (langId === 54 || langId === 76 || langId === 81 || langId === 82 || langId === 10 || langId === 1) {
            wrappedCode = `
#include <iostream>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

${userCode.replace(/function solution\(input\)/g, "int solution(std::string input)")}

int main() {
    std::string input;
    std::getline(std::cin, input);
    int result = solution(input);
    std::cout << result << std::endl;
    return 0;
}`;
          }
          // If no specific language wrapper is defined, use the code as is
          else {
            wrappedCode = userCode;
          }
          
          // Encode the wrapped code in base64
          const base64Code = btoa(wrappedCode);
          const base64Input = btoa(wrappedInput);
          
          // Submit user's code with the test case input
          const response = await fetch(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                // "X-RapidAPI-Key": "fd14a2165emsh33dccf942f011e6p1a0a8ejsnc5c047d84cf0",
                "X-RapidAPI-Key": "fd14a2165emsh33dccf942f011e6p1a0a8ejsnc5c047d84cf0",
              },
              body: JSON.stringify({
                source_code: base64Code,
                language_id: langId,
                stdin: base64Input,
              }),
            }
          );

          const outputData = await response.json();
          console.log("Judge0 API response for test case", testCase.id, ":", outputData);
          
          // Process the result
          let actualOutput = "";
          let status = "ERROR";
          let errorMessage = "";
          
          if (outputData.status) {
            if (outputData.status.id === 3) { // Status 3 means Accepted/Success
              if (outputData.stdout) {
                actualOutput = atob(outputData.stdout).trim();
                status = actualOutput === testCase.expectedOutput.trim() ? "PASSED" : "FAILED";
              } else {
                errorMessage = "No output produced but execution succeeded.";
              }
            } else {
              // Handle other status codes
              errorMessage = `Execution status: ${outputData.status.description}`;
              
              if (outputData.compile_output) {
                try {
                  errorMessage += "\nCompilation error: " + atob(outputData.compile_output);
                } catch (e) {
                  errorMessage += "\nCompilation error: " + outputData.compile_output;
                }
              }
              
              if (outputData.stderr) {
                try {
                  errorMessage += "\nStandard error: " + atob(outputData.stderr);
                } catch (e) {
                  errorMessage += "\nStandard error: " + outputData.stderr;
                }
              }
              
              if (outputData.message) {
                errorMessage += "\nMessage: " + outputData.message;
              }
            }
          } else {
            errorMessage = "Unknown error: No status returned from API.";
          }
          
          results.push({
            id: testCase.id,
            status,
            expected: testCase.expectedOutput,
            actual: actualOutput,
            error: errorMessage
          });
        } catch (error) {
          console.error("API test case error:", error);
          setError(error)
          results.push({
            id: testCase.id,
            status: "ERROR",
            expected: testCase.expectedOutput,
            actual: "",
            error: `API Error: ${error.message}`
          });
        }
      }
      
      // Format and display results
      let outputText = "Test Results:\n\n";
      let passCount = 0;
      
      results.forEach(result => {
        if (result.status === "PASSED") {
          passCount++;
          outputText += `Test Case ${result.id}: ✅ PASSED\n`;
          outputText += `  Expected: ${result.expected}\n`;
          outputText += `  Got: ${result.actual}\n\n`;
        } else if (result.status === "FAILED") {
          outputText += `Test Case ${result.id}: ❌ FAILED\n`;
          outputText += `  Expected: ${result.expected}\n`;
          outputText += `  Got: ${result.actual}\n\n`;
        } else {
          outputText += `Test Case ${result.id}: ❌ ERROR\n`;
          outputText += `  ${result.error}\n\n`;
        }
      });
      
      outputText += `\nSummary: ${passCount}/${results.length} tests passed`;
      setOutput(outputText);
      
    } catch (error) {
      console.error("Judge0 API error:", error);
      setOutput(`Error running tests with Judge0 API: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const [lang, setLang] = useState([]);

  useEffect(() => {
    const fetchLang = async () => {
      try {
        const response = await fetch(
          "https://judge0-ce.p.rapidapi.com/languages",
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              "X-RapidAPI-Key": "5d6411b213mshe2d82efc15bbbdbp1b5b12jsn704c4a74dd9b",
            },
          }
        );
        const data = await response.json();
        setLang(data);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };
    fetchLang();
  }, []);

  const addTestCase = () => {
    const newId =
      testCaseState.length > 0 ? Math.max(...testCaseState.map((tc) => tc.id)) + 1 : 1;
    setTestCaseState([
      ...testCaseState,
      { id: newId, input: "", expectedOutput: "", active: true },
    ]);
  };

  const updateTestCase = (id, field, value) => {
    setTestCaseState(
      testCaseState.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const toggleTestCase = (id) => {
    setTestCaseState(
      testCaseState.map((tc) => (tc.id === id ? { ...tc, active: !tc.active } : tc))
    );
  };

  const removeTestCase = (id) => {
    setTestCaseState(testCaseState.filter((tc) => tc.id !== id));
  };

  const handleKeyDown = (e) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior
      
      // Get cursor position
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Insert tab at cursor position (2 spaces)
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      // Move cursor after the inserted tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-auto overflow-x-hidden">
      {/* Header with title */}
      <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex gap-4">
          <h2 className="text-lg font-semibold">Code Challenge</h2>
          <div className="relative inline-block text-black">
            <select
              className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setLangId(parseInt(e.target.value))}
              value={langId}
            >
              {lang.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-2 ${
            activeTab === "code"
              ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}
          onClick={() => setActiveTab("code")}
        >
          Code Editor
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "testCases"
              ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}
          onClick={() => setActiveTab("testCases")}
        >
          Test Cases
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-grow flex-col">
        {/* Code editor */}
        {activeTab === "code" && (
          <div className="h-full relative">
            <textarea
              className="w-full h-full p-3 pl-8 bg-gray-900 text-gray-200 font-mono text-sm border-none focus:outline-none resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e);
                e.stopPropagation();
              }}
              spellCheck="false"
            ></textarea>
          </div>
        )}

        {/* Test cases tab */}
        {activeTab === "testCases" && (
          <div className="flex-grow overflow-auto p-3">
            <div className="mb-4">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                onClick={addTestCase}
              >
                Add Test Case
              </button>
            </div>

            {testCaseState.map((testCase) => (
              <div
                key={testCase.id}
                className="mb-4 bg-gray-800 rounded-md p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={testCase.active}
                      onChange={() => toggleTestCase(testCase.id)}
                      className="mr-2"
                    />
                    <span className="font-semibold">
                      Test Case {testCase.id}
                    </span>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => removeTestCase(testCase.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2">
                  <label className="block text-sm text-gray-400 mb-1">
                    Input
                  </label>
                  <textarea
                    className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
                    value={testCase.input}
                    onChange={(e) =>
                      updateTestCase(testCase.id, "input", e.target.value)
                    }
                    rows={2}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Expected Output
                  </label>
                  <textarea
                    className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(
                        testCase.id,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                    rows={2}
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output area */}
      <div className="sticky bottom-0 bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Output</span>
          <div className="flex space-x-2">
            <button
              onClick={runWithJudge0}
              disabled={isRunning}
              className={`px-4 py-1 ${
                isRunning ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"
              } rounded-md text-sm transition`}
            >
              Run with API
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className={`px-4 py-1 ${
                isRunning ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
              } rounded-md text-sm transition`}
            >
              Run Tests Locally
            </button>
          </div>
        </div>
        <div className="bg-gray-900 p-2 rounded-md text-sm font-mono text-gray-300 h-40 overflow-auto whitespace-pre-wrap">
          {output || "// Test results will appear here"}
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;