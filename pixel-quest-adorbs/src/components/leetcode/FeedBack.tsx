import React, { useState } from 'react';
import {errorAndImprovements} from '../api/courseDataApi.js'
import { useEffect } from 'react';

const FeedbackAnalysis = ({ userCode, testResults, q,error, code }) => {
  console.log(q)
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [feedbackData, setFeedbackData] = useState({
    overview: {
      score: 85,
      complexity: "O(n)",
      status: "Passing",
      strengths: ["Good variable naming", "Efficient algorithm", "Clean structure"],
      weaknesses: ["Could improve time complexity", "Missing edge case handling"]
    },
    analysis: [
      {
        lineNumber: 12,
        severity: "suggestion",
        message: "Consider using a hash map to improve lookup efficiency",
        code: "for (let i = 0; i < nums.length; i++) {"
      },
      {
        lineNumber: 18,
        severity: "warning",
        message: "This may cause an out-of-bounds error with empty arrays",
        code: "if (nums[i] + nums[j] === target) {"
      },
      {
        lineNumber: 24,
        severity: "improvement",
        message: "Early return opportunity to optimize runtime",
        code: "// Continue searching through the array"
      }
    ],
    alternatives: [
      {
        title: "Hash Map Approach",
        complexity: "O(n)",
        description: "Uses a hash map to store values and their indices for O(1) lookups",
        snippet: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return null;\n}"
      },
      {
        title: "Sorted Array Approach",
        complexity: "O(n log n)",
        description: "For sorted arrays, using two pointers can be more memory efficient",
        snippet: "function twoSum(nums, target) {\n  const sorted = [...nums].map((val, idx) => [val, idx]).sort((a, b) => a[0] - b[0]);\n  let left = 0;\n  let right = sorted.length - 1;\n  \n  while (left < right) {\n    const sum = sorted[left][0] + sorted[right][0];\n    if (sum === target) {\n      return [sorted[left][1], sorted[right][1]];\n    } else if (sum < target) {\n      left++;\n    } else {\n      right--;\n    }\n  }\n  return null;\n}"
      }
    ]
  })

  const fetchAiFeedBack = async ()=>{
    try {
      let response = await errorAndImprovements(q.title+q.discription, code, error)
      console.log("response", response)

      if (response.includes("```")) {
        response = response.replace(/```json\s*/g, "");
        response = response.replace(/```\s*/g, "");
    }
    
    // Parse the JSON response
    const responseData = JSON.parse(response);
    console.log("Parsed data:", responseData);
    setFeedbackData(responseData)
    } catch (error) {
     console.log(error) 
    }
  }

  useEffect(()=>{
    fetchAiFeedBack()
  },[])

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setFeedbackExpanded(!feedbackExpanded)}
        >
          <div className="text-lg font-bold flex items-center">
            <div className="text-yellow-400 mr-2">🧠</div>
            <div>AI Code Feedback</div>
          </div>
          <div className="text-gray-400">
            {feedbackExpanded ? '▼' : '►'}
          </div>
        </div>
        
        {feedbackExpanded && (
          <div className="mt-3 text-sm text-gray-300">
            AI analysis of your code solution. Get insights on performance, potential bugs, and suggested improvements.
          </div>
        )}
      </div>
      
      {feedbackExpanded && (
        <div className="flex-1 flex flex-col bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <div className="flex bg-gray-900 border-b border-gray-700">
            <div 
              className={`px-4 py-2 cursor-pointer border-b-2 ${selectedSection === 'overview' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setSelectedSection('overview')}
            >
              Overview
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer border-b-2 ${selectedSection === 'issues' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setSelectedSection('issues')}
            >
              Issues
            </div>
            <div 
              className={`px-4 py-2 cursor-pointer border-b-2 ${selectedSection === 'alternatives' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setSelectedSection('alternatives')}
            >
              Alternatives
            </div>
          </div>
          
          <div className="p-4 overflow-auto flex-1">
            {selectedSection === 'overview' && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-1">Score</div>
                    <div className="text-2xl font-bold text-green-400">{feedbackData.overview.score}%</div>
                  </div>
                  <div className="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-1">Complexity</div>
                    <div className="text-2xl font-bold text-blue-400">{feedbackData.overview.complexity}</div>
                  </div>
                  <div className="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col items-center">
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <div className="text-2xl font-bold text-green-400">{feedbackData.overview.status}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-3 rounded border border-gray-700">
                    <div className="font-bold mb-2 text-green-400">Strengths</div>
                    <ul className="space-y-2 text-sm">
                      {feedbackData.overview.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <div className="text-green-500 mr-2">✓</div>
                          <div>{strength}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900 p-3 rounded border border-gray-700">
                    <div className="font-bold mb-2 text-yellow-400">Areas to Improve</div>
                    <ul className="space-y-2 text-sm">
                      {feedbackData.overview.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <div className="text-yellow-500 mr-2">!</div>
                          <div>{weakness}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {selectedSection === 'issues' && (
              <div className="space-y-4">
                {feedbackData.analysis.map((issue, index) => {
                  let iconColor = "text-blue-400";
                  let borderColor = "border-blue-400";
                  let bgColor = "bg-blue-900";
                  let icon = "💡";
                  
                  if (issue.severity === "warning") {
                    iconColor = "text-yellow-400";
                    borderColor = "border-yellow-400";
                    bgColor = "bg-yellow-900";
                    icon = "⚠️";
                  } else if (issue.severity === "error") {
                    iconColor = "text-red-400";
                    borderColor = "border-red-400";
                    bgColor = "bg-red-900";
                    icon = "❌";
                  }
                  
                  return (
                    <div key={index} className={`p-3 rounded border ${borderColor} ${bgColor} bg-opacity-20`}>
                      <div className="flex items-start">
                        <div className={`${iconColor} mr-2`}>{icon}</div>
                        <div className="flex-1">
                          <div className="font-bold">{issue.message}</div>
                          <div className="text-xs text-gray-400 mt-1">Line {issue.lineNumber}</div>
                          <pre className="mt-2 p-2 bg-gray-950 rounded text-gray-300 text-sm overflow-x-auto">
                            {issue.code}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {selectedSection === 'alternatives' && (
              <div className="space-y-4">
                {feedbackData.alternatives.map((alt, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">{alt.title}</div>
                      <div className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-300">{alt.complexity}</div>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">{alt.description}</div>
                    <pre className="p-3 bg-gray-950 rounded text-gray-300 text-sm overflow-x-auto">
                      {alt.snippet}
                    </pre>
                    <div className="mt-3 flex justify-end">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs">
                        Apply This Solution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      )}
    </div>
  );
};

export default FeedbackAnalysis;