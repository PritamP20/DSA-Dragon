import { useState, useEffect } from 'react';

const InteractiveFeedback = ({ performance, onExtractCode }) => {
  const [feedback, setFeedback] = useState('');
  const [extractedCode, setExtractedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');

  // Extract code from the LeetCode page
  const extractCodeFromLeetCode = async () => {
    setIsLoading(true);
    try {
      // Get the current tab's URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;

      // Ensure the tab is a LeetCode problem page
      if (!url.includes('leetcode.com/problems/')) {
        throw new Error('This is not a valid LeetCode problem page.');
      }

      // Execute a script in the context of the LeetCode page to extract the code
      const code = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const codeElement = document.querySelector('.monaco-editor textarea');
          return codeElement ? codeElement.value : null;
        },
      });

      if (code && code[0]?.result) {
        setExtractedCode(code[0].result);
        fetchFeedback(code[0].result); // Send the code to the AI for feedback
      } else {
        throw new Error('No code found on the page.');
      }
    } catch (error) {
      console.error('Error extracting code:', error);
      setFeedback('Failed to extract code from the page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feedback from the AI
  const fetchFeedback = async (code) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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', // Replace with your Groq API key
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful coding assistant. Provide constructive feedback on the given code without revealing the solution directly. Focus on improvements, best practices, and potential optimizations. Give the solution in plaintext. Do not use bold, italics or any kind of formatting. Only use punctuations and proper case letters. Do not write it in points, give the answers within 10 lines.',
            },
            {
              role: 'user',
              content: `Here is my code for the LeetCode problem. Please provide feedback:\n\n${code}`,
            },
          ],
          max_tokens: 150, // Limit the response length
        }),
      });

      const data = await response.json();
      const feedback = data.choices[0]?.message?.content?.trim();

      if (feedback) {
        setFeedback(feedback); // Set the feedback from the API response
      } else {
        setFeedback('No feedback available. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback('Failed to fetch feedback. Please try again.');
    }
  };

  // Extract code and fetch feedback when the component mounts
  useEffect(() => {
    extractCodeFromLeetCode();
  }, []);

  // Set random motivational message on component mount
  useEffect(() => {
    const messages = [
      "Ready to tackle today's coding challenge? You've got this!",
      "Remember: every bug you fix makes you a better developer.",
      "Consistency is key to mastering algorithms. Keep going!",
      "Think step by step. Break down the problem before coding.",
      "Don't compare your progress to others. Focus on your growth.",
      "The best way to learn is by doing. Dive into the challenge!",
      "Stuck? Try explaining the problem out loud - it works wonders.",
      "Great coders are patient problem-solvers. Take your time.",
      "One algorithm at a time leads to lasting knowledge.",
      "Remember to test edge cases in your solution!"
    ];

    setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  // Get performance icon
  const getPerformanceIcon = () => {
    switch (performance) {
      case 'Excellent':
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-green-900/40 rounded-full">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Good':
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-blue-900/40 rounded-full">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v2a1 1 0 102 0V5zm-1 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-yellow-900/40 rounded-full">
            <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 mb-3 border border-zinc-800/60 shadow-lg flex-grow overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-zinc-300">Interactive Feedback</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${
            performance === 'Excellent' ? 'text-green-400' : 
            performance === 'Good' ? 'text-blue-400' : 
            'text-yellow-400'
          }`}>
            {performance}
          </span>
          {getPerformanceIcon()}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-zinc-800/40 rounded-lg p-4 flex-grow border border-zinc-700/30">
          <p className="text-sm text-zinc-300">Analyzing your code...</p>
        </div>
      ) : extractedCode ? (
        <div className="flex flex-col space-y-2 flex-grow">
          {/* Code Preview */}
          <div className="bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/30 flex-grow overflow-auto">
            <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
              {extractedCode}
            </pre>
          </div>
          
          {/* Feedback */}
          {feedback && (
            <div className="bg-purple-900/30 border border-purple-800/40 rounded-lg p-2">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-zinc-300">{feedback}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-zinc-800/40 rounded-lg p-4 flex-grow border border-zinc-700/30">
          <div className="flex items-start px-2">
            <svg className="w-5 h-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-zinc-300">
              {motivationalMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveFeedback;