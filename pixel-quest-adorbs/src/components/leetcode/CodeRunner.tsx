import React, { useEffect, useState } from "react";

const CodeRunner = () => {
  const [code, setCode] = useState("// Write your solution here\nfunction solution(input) {\n  // Your code here\n  return result;\n}");
  const [activeTab, setActiveTab] = useState("code"); // "code", "testCases"
  const [testCases, setTestCases] = useState([
    { id: 1, input: "[1, 2, 3, 4]", expectedOutput: "10", active: true },
    { id: 2, input: "[-1, -2, 10]", expectedOutput: "7", active: false }
  ]);
  const [landId, setLandId] = useState(71);
  const [output, setOutput] = useState("");

  const handleSubmit = async() => {
    try {
        const base64 = btoa(code);
        console.log(code, base64)
        const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': '5d6411b213mshe2d82efc15bbbdbp1b5b12jsn704c4a74dd9b'
            },
            body: JSON.stringify({
                source_code: base64,
                language_id: 71,
                stdin: testCases[0].input
            }),
        });
    
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        const outputResonse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': '5d6411b213mshe2d82efc15bbbdbp1b5b12jsn704c4a74dd9b'
            }
        });
        const outputData = await outputResonse.json();
        console.log(outputData);
        console.log("message", atob(outputData.message))
        console.log("Post Execution: ", atob(outputData.stderr))
        console.log("stdout", atob(outputData.stdout))
        setOutput(atob(outputData.stdout))

    } catch (error) {
        console.log(error)
    }
  }

  const [lang, setLang] = useState([]);

  useEffect(() => {
    const fetchLang = async () => {
        const response = await fetch('https://judge0-ce.p.rapidapi.com/languages',{
            method:'GET',
            headers:{
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': '5d6411b213mshe2d82efc15bbbdbp1b5b12jsn704c4a74dd9b'
            }
        });
        const data = await response.json();
        console.log(data)
        setLang(data);
    }
    fetchLang();
  },[])


  const runCode = () => {
    setOutput("Running tests...");
    // Here you would integrate with Judge0 or similar API
    setTimeout(() => {
      setOutput("Test Case 1: PASSED\nTest Case 2: FAILED\nExpected 7, got 8");
    }, 1000);
  };

  const addTestCase = () => {
    const newId = testCases.length > 0 ? Math.max(...testCases.map(tc => tc.id)) + 1 : 1;
    setTestCases([...testCases, { id: newId, input: "", expectedOutput: "", active: false }]);
  };

  const updateTestCase = (id, field, value) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const toggleTestCase = (id) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, active: !tc.active } : tc
    ));
  };

  const removeTestCase = (id) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-auto overflow-x-hidden">
      {/* Header with title */}
      <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex gap-4">
        <h2 className="text-lg font-semibold">Code Challenge</h2>
            <div className="relative inline-block text-black">
                <select className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setLandId(parseInt(e.target.value))}>
                    {lang.map((l) => (
                        <option key={l.id} value={l.id} >{l.name}</option>
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
          className={`px-4 py-2 ${activeTab === 'code' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('code')}
        >
          Code Editor
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'testCases' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          onClick={() => setActiveTab('testCases')}
        >
          Test Cases
        </button>
      </div>

      {/* Main content area */}
      <div className=" flex flex-grow flex-col">
        {/* Code editor */}
        {activeTab === 'code' && (
          <div className=" x h-full relative">
            {/* <div className=" left-0 top-0 p-3 text-gray-600 font-mono text-sm pointer-events-none">
              {code.split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div> */}
            <textarea
              className="w-full h-full p-3 pl-8 bg-gray-900 text-gray-200 font-mono text-sm border-none focus:outline-none resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            ></textarea>
          </div>
        )}

        {/* Test cases tab */}
        {activeTab === 'testCases' && (
          <div className="flex-grow overflow-auto p-3">
            <div className="mb-4">
              <button 
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                onClick={addTestCase}
              >
                Add Test Case
              </button>
            </div>
            
            {testCases.map(testCase => (
              <div key={testCase.id} className="mb-4 bg-gray-800 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={testCase.active}
                      onChange={() => toggleTestCase(testCase.id)}
                      className="mr-2"
                    />
                    <span className="font-semibold">Test Case {testCase.id}</span>
                  </div>
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => removeTestCase(testCase.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2">
                  <label className="block text-sm text-gray-400 mb-1">Input</label>
                  <textarea
                    className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
                    value={testCase.input}
                    onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                    rows={2}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Expected Output</label>
                  <textarea
                    className="w-full p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded-md text-sm font-mono"
                    value={testCase.expectedOutput}
                    onChange={(e) => updateTestCase(testCase.id, 'expectedOutput', e.target.value)}
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
            <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition"
            >
            Run Tests
            </button>
        </div>
        <div className="bg-gray-900 p-2 rounded-md text-sm font-mono text-gray-300 h-20 overflow-auto">
            {output || "// Test results will appear here"}
        </div>
        </div>

    </div>
  );
};

export default CodeRunner;