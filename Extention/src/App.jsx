import { useState, useEffect } from "react";
import { fetchLeetCodeProblemDetails, extractProblemSlug } from "./api/fetch-content";
import MetaballsBackground from "./components/MetaballsBackground";
import HintSection from "./components/HintSection";
import InteractiveFeedback from "./components/InteractiveFeedback";
import SolutionSection from "./components/SolutionSection";

const LeetCodeTracker = () => {
  const [solutions, setSolutions] = useState([]);
  const [performance, setPerformance] = useState("Good");
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState({
    number: "",
    title: "",
    difficulty: "",
  });
  const [extractedCode, setExtractedCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  // Fetch current LeetCode problem details
  useEffect(() => {
    const fetchCurrentProblem = async () => {
      try {
        // Get the current tab URL
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab.url;

        // Extract the problem slug from the URL
        const problemSlug = extractProblemSlug(url);

        // Fetch problem details from the GraphQL API
        const problemDetails = await fetchLeetCodeProblemDetails(problemSlug);

        // Update the current question state
        setCurrentQuestion({
          number: `#${problemDetails.questionId}`,
          title: problemDetails.title,
          difficulty: problemDetails.difficulty,
        });
      } catch (error) {
        console.error("Error fetching problem details:", error);
        setCurrentQuestion({
          number: "Error",
          title: "Error",
          difficulty: "Error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentProblem();
  }, []);

  // Mock data for demonstration - in real extension, fetch from storage
  useEffect(() => {
    setTimeout(() => {
      const mockData = [
        { id: 1, title: 'Two Sum', difficulty: 'Easy', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', date: '2025-03-15' },
        { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', timeComplexity: 'O(n)', spaceComplexity: 'O(n)', date: '2025-03-17' },
        { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', timeComplexity: 'O(n)', spaceComplexity: 'O(min(m,n))', date: '2025-03-19' },
      ];
      setSolutions(mockData);
    }, 1000);
  }, []);

  // Calculate performance based on solutions
  useEffect(() => {
    if (solutions.length === 0) return;

    const difficultyScore = solutions.reduce((acc, sol) => {
      if (sol.difficulty === 'Easy') return acc + 1;
      if (sol.difficulty === 'Medium') return acc + 2;
      if (sol.difficulty === 'Hard') return acc + 3;
      return acc;
    }, 0);

    if (difficultyScore > 5) {
      setPerformance('Excellent');
    } else if (difficultyScore > 3) {
      setPerformance('Good');
    } else {
      setPerformance('Can Be Improved');
    }
  }, [solutions]);

  // Extract code from current LeetCode page
  const extractCode = () => {
    // Mock extracting code for demo purposes
    const mockCode = `function containsDuplicate(nums) {
  const set = new Set();
  for (const num of nums) {
    if (set.has(num)) return true;
    set.add(num);
  }
  return false;
}`;

    setExtractedCode(mockCode);

    // Add to solutions
    const newSolution = {
      id: solutions.length + 1,
      title: currentQuestion.title,
      difficulty: currentQuestion.difficulty,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      date: new Date().toISOString().split('T')[0]
    };

    setSolutions([...solutions, newSolution]);
  };

  // Handle give up action
  const handleGiveUp = () => {
    setShowSolution(true);
  };

  // Get difficulty color class
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/40';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/40';
      case 'Hard': return 'text-red-400 bg-red-900/40';
      default: return 'text-blue-400 bg-blue-900/40';
    }
  };

  return (
    <div className="w-96 h-[600px] relative bg-zinc-900 text-zinc-100 p-5 overflow-hidden font-sans">
      {/* Metaballs Background */}
      <div className="absolute inset-0 overflow-hidden">
        <MetaballsBackground />
      </div>

      {/* Content container with glass effect */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        <div className="space-y-3 flex-grow overflow-auto pb-16">
          {/* Team Name Header */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-zinc-800/60 shadow-lg">
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Cryptic Nomads
              </h1>
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-zinc-800/60 shadow-lg">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Current Question</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <div className="flex items-baseline mt-1 space-x-2">
                <span className="text-purple-400 font-mono">{currentQuestion.number}</span>
                <h2 className="text-lg font-semibold text-white">{currentQuestion.title}</h2>
              </div>
            </div>
          </div>

          {/* Hints Section */}
          <HintSection currentQuestion={currentQuestion} />

          {/* Interactive Feedback */}
          <InteractiveFeedback
            extractedCode={extractedCode}
            performance={performance}
            onExtractCode={extractCode}
          />

          {/* Solution Section - Only visible after clicking "Give Up" */}
          {showSolution && (
            <SolutionSection currentQuestion={currentQuestion} />
          )}
        </div>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="flex flex-col space-y-2 absolute bottom-5 left-5 right-5">
          <div className="flex space-x-2">
            <button
              onClick={handleGiveUp}
              className={`flex-1 px-3 py-2 ${showSolution ? 'bg-zinc-600/80 hover:bg-zinc-700/80' : 'bg-red-600/80 hover:bg-red-700/80'} rounded-lg text-sm font-medium backdrop-blur-sm transition-colors flex items-center justify-center`}
              disabled={showSolution}
            >
              <svg className="w-4 h-4 mr-1" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Give up!
            </button>
          </div>
          <a 
            href="http://localhost:8081/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700/80 hover:to-blue-700/80 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Explore CODEQUEST
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeTracker;