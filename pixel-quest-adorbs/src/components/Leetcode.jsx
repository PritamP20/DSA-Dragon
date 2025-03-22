import React, { useState, useEffect, forwardRef } from 'react';
import CodeRunner from "./leetcode/CodeRunner";
import FeedbackAnalysis from "./leetcode/FeedBack";
import ChatBot from "../components/ChatBot/ChatBot"
import MapTitle from "../components/mapchange/MapTitle"

const Leetcode = forwardRef(({ w, h, q, isFocused, testcases }, ref) => {
  console.log("Leetcode component re-rendered");
  const [showOutput, setShowOutput] = useState(false);
  const [activeSection, setActiveSection] = useState('code');
  const [xpPoints, setXpPoints] = useState(142);
  const [level, setLevel] = useState(3);
  const [streakDays, setStreakDays] = useState(5);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [code, setCode] = useState(
    "// Write your solution here\nfunction solution(input) {\n  // Parse the input string into an array of numbers\n  const numbers = JSON.parse(input);\n  \n  // Sum all the numbers in the array\n  let result = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    result += numbers[i];\n  }\n  \n  return result;\n}"
  );
  const [error,  setError] = useState("no error yet");
  
  
  // Mock data
  const completedProblems = 17;
  const totalProblems = 25;
  const progress = (completedProblems / totalProblems) * 100;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // If editor is focused, prevent space key from propagating to the game
      if (isFocused && e.key === ' ') {
        e.stopPropagation();
      }
      
      // Nav with arrow keys when focused
      if (isFocused) {
        const sections = ['code', 'profile', 'progress', 'learning', 'notes', 'feedback', 'chatbot', "map"];
        const currentIndex = sections.indexOf(activeSection);
        
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          setActiveSection(sections[currentIndex - 1]);
          e.preventDefault();
        } else if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
          setActiveSection(sections[currentIndex + 1]);
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          setSidebarCollapsed(true);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          setSidebarCollapsed(false);
          e.preventDefault();
        }
      }
    };

    if (isFocused) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isFocused, activeSection]);

  // Styling constants
  const menuItemBase = "px-4 py-3 flex items-center border-l-4 transition-all duration-200 relative";
  const menuItemActive = "border-yellow-500 bg-gray-800 text-yellow-400";
  const menuItemInactive = "border-transparent hover:border-gray-600 hover:bg-gray-900 text-gray-400 hover:text-gray-300";
  
  return (
    <div className="bg-gray-950 text-white border border-gray-800 flex flex-col overflow-hidden" style={{width: w, height: h}}>
      {/* Header with game logo */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold text-yellow-400 tracking-wider">CODE<span className="text-white">QUEST</span></div>
          <div className="ml-2 px-2 py-1 bg-gray-900 rounded text-xs text-gray-400">v1.0</div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gray-900 px-2 py-1 rounded flex items-center">
            <span className="text-yellow-500 mr-1">⚡</span>
            <span className="text-xs">{streakDays} DAY STREAK</span>
          </div>
          <div className="text-xs bg-blue-900 px-2 py-1 rounded">LVL {level}</div>
        </div>
      </div>

      {/* Main content area with side navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toggle button for sidebar - visible when collapsed */}
        {sidebarCollapsed && (
          <div 
            className="w-8 bg-gray-900 border-r border-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarCollapsed(false)}
          >
            <div className="text-gray-400 text-xl">⟩</div>
          </div>
        )}
        
        {/* Navigation sidebar with animation */}
        <div 
          className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-48 opacity-100'
          }`}
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-800">
            <div className="text-sm font-bold text-gray-300">NAVIGATION</div>
            <div 
              className="text-gray-500 hover:text-gray-300 cursor-pointer"
              onClick={() => setSidebarCollapsed(true)}
            >
              ⟨
            </div>
          </div>
          
          <div 
            className={`${menuItemBase} ${activeSection === 'code' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('code')}
          >
            <div className="mr-3">🧩</div>
            <div>Code Editor</div>
            {activeSection === 'code' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          
          <div 
            className={`${menuItemBase} ${activeSection === 'profile' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('profile')}
          >
            <div className="mr-3">👤</div>
            <div>Profile</div>
            {activeSection === 'profile' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          
          <div 
            className={`${menuItemBase} ${activeSection === 'progress' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('progress')}
          >
            <div className="mr-3">📊</div>
            <div>Progress</div>
            {activeSection === 'progress' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          
          <div 
            className={`${menuItemBase} ${activeSection === 'learning' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('learning')}
          >
            <div className="mr-3">📚</div>
            <div>Learning</div>
            {activeSection === 'learning' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          
          <div 
            className={`${menuItemBase} ${activeSection === 'notes' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('notes')}
          >
            <div className="mr-3">📝</div>
            <div>Notes</div>
            {activeSection === 'notes' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          <div 
            className={`${menuItemBase} ${activeSection === 'feedback' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('notes')}
          >
            <div className="mr-3">📝</div>
            <div>Feedback</div>
            {activeSection === 'feedback' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>

          <div 
            className={`${menuItemBase} ${activeSection === 'chatbot' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('notes')}
          >
            <div className="mr-3">📝</div>
            <div>ChatBot</div>
            {activeSection === 'chatbot' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>

          <div 
            className={`${menuItemBase} ${activeSection === 'map' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('notes')}
          >
            <div className="mr-3">📝</div>
            <div>Map</div>
            {activeSection === 'map' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-1">XP Points</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                style={{ width: `${(xpPoints % 100) / 100 * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">{xpPoints} / {Math.floor(xpPoints / 100) * 100 + 100}</div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {activeSection === 'code' && (
            <div className="h-full flex flex-col">
              {/* <div className="mb-4 bg-gray-800 p-4 rounded border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-lg font-bold">{q !== 'Nothing' ? q : 'Select a Challenge'}</div>
                  <div className="flex space-x-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">HINTS</button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">DOCS</button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {q !== 'Nothing' 
                    ? 'Solve this problem using your coding skills. Remember to optimize your solution.'
                    : 'Visit the game world to find coding challenges and unlock new abilities.'}
                </div>
              </div> */}
              
              <div className="flex-1 bg-gray-800 rounded border border-gray-700 overflow-hidden">
                <CodeRunner testCases={testcases} q={q} code={code} setCode={setCode} setError={setError}/>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                  Reset
                </button>
                <div>
                  <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm mr-2">
                    Test
                  </button>
                  <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'profile' && (
            <div className="h-full">
              <div className="bg-gray-800 p-6 rounded border border-gray-700 mb-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="ml-4">
                    <div className="text-xl font-bold">Pixel Coder</div>
                    <div className="text-gray-400">Level {level} Explorer</div>
                    <div className="flex mt-2">
                      <div className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded mr-2">Algorithm Master</div>
                      <div className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Data Wizard</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Solved Problems</div>
                  <div className="text-2xl font-bold">{completedProblems}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Current Streak</div>
                  <div className="text-2xl font-bold">{streakDays} days</div>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">XP Points</div>
                  <div className="text-2xl font-bold">{xpPoints}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Achievements</div>
                  <div className="text-2xl font-bold">7/12</div>
                </div>
              </div>
          
              <div className="mt-4 bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="font-bold mb-3">Recent Achievements</h3>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-gray-900 rounded">
                    <div className="text-yellow-500 mr-2">🏆</div>
                    <div>
                      <div className="font-bold">First Dynamic Programming Solution</div>
                      <div className="text-xs text-gray-400">3 days ago</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-gray-900 rounded">
                    <div className="text-yellow-500 mr-2">🏆</div>
                    <div>
                      <div className="font-bold">5 Day Streak</div>
                      <div className="text-xs text-gray-400">Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'progress' && (
            <div className="h-full">
              <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-4">
                <h3 className="font-bold mb-3">Overall Progress</h3>
                <div className="w-full bg-gray-900 rounded-full h-4 mb-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>{completedProblems} completed</div>
                  <div>{totalProblems} total</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-2">Algorithm Skills</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Arrays</span>
                        <span>80%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Strings</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Trees</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-2">Difficulty Breakdown</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Easy</span>
                        <span>9/10</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Medium</span>
                        <span>7/12</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Hard</span>
                        <span>1/3</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2 mt-1">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="font-bold mb-3">Quest Map</h3>
                <div className="flex justify-center">
                  <div className="relative w-full h-48 bg-gray-900 rounded">
                    {/* Simple quest map visualization */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700"></div>
                    <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-2/4 w-4 h-4 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-3/4 w-4 h-4 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-3/4 left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-7/8 w-6 h-6 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs">🏆</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'learning' && (
            <div className="h-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-3">My Learning Path</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-900 rounded flex items-center">
                      <div className="text-green-500 mr-2">✓</div>
                      <div>Array Fundamentals</div>
                    </div>
                    <div className="p-2 bg-gray-900 rounded flex items-center">
                      <div className="text-green-500 mr-2">✓</div>
                      <div>String Manipulation</div>
                    </div>
                    <div className="p-2 bg-gray-900 rounded flex items-center">
                      <div className="text-yellow-500 mr-2">⊕</div>
                      <div>Binary Trees</div>
                    </div>
                    <div className="p-2 bg-gray-900 rounded flex items-center">
                      <div className="text-gray-600 mr-2">○</div>
                      <div>Dynamic Programming</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h3 className="font-bold mb-3">Unlocked Abilities</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-900 bg-opacity-30 rounded flex items-center">
                      <div className="text-blue-400 mr-2">⚡</div>
                      <div>
                        <div className="font-bold">Quick Sort</div>
                        <div className="text-xs text-gray-400">Optimized array sorting</div>
                      </div>
                    </div>
                    <div className="p-2 bg-purple-900 bg-opacity-30 rounded flex items-center">
                      <div className="text-purple-400 mr-2">⚡</div>
                      <div>
                        <div className="font-bold">Hash Map Vision</div>
                        <div className="text-xs text-gray-400">O(1) lookup operations</div>
                      </div>
                    </div>
                    <div className="p-2 bg-green-900 bg-opacity-30 rounded flex items-center">
                      <div className="text-green-400 mr-2">⚡</div>
                      <div>
                        <div className="font-bold">Binary Search</div>
                        <div className="text-xs text-gray-400">Efficient data finding</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="font-bold mb-3">Next Challenge</h3>
                <div className="bg-gray-900 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-bold">Tree Traversal Mastery</div>
                    <div className="text-sm text-yellow-500">Medium</div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Master pre-order, in-order, and post-order traversals of binary trees.
                  </div>
                  <div className="mt-3">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                      Start Challenge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div 
            className={`${menuItemBase} ${activeSection === 'feedback' ? menuItemActive : menuItemInactive}`}
            onClick={() => setActiveSection('feedback')}
          >
            <div className="mr-3">🧠</div>
            <div>AI Feedback</div>
            {activeSection === 'feedback' && <div className="absolute right-2 text-xs">⟩</div>}
          </div>

          {activeSection === 'feedback' && (
            <FeedbackAnalysis userCode={2} testResults={"good"} q={q} error={error} code={code} />
          )}

          {activeSection === 'chatbot' && (
              <ChatBot />
          )}

          {activeSection === 'map' && (
              <MapTitle />
          )}
          
          {activeSection === 'notes' && (
            <div className="h-full">
              <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold">My Notes</h3>
                  <button className="bg-green-600 hover:bg-green-500 text-white text-xs px-2 py-1 rounded">
                    + New Note
                  </button>
                </div>
                <textarea 
                  className="w-full h-32 bg-gray-900 text-gray-300 p-3 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Write your notes here..."
                ></textarea>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="font-bold">Array Two Pointer Technique</div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Remember to use two pointer technique for problems requiring finding pairs in sorted arrays. 
                    Start from opposite ends and move inward.
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="font-bold">BFS vs DFS</div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    BFS uses queue, good for finding shortest path. DFS uses stack (or recursion), good for exploring all paths.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="bg-gray-900 border-t border-gray-800 p-2 flex justify-between items-center text-xs text-gray-500">
        <div>{isFocused ? '⌨️ KEYBOARD ACTIVE' : '🖱️ CLICK TO FOCUS'}</div>
        <div>Use ↑↓ to navigate • SPACE to select • ← → to toggle sidebar</div>
      </div>
    </div>
  );
});

export default Leetcode;