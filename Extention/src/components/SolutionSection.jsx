import { useState, useEffect } from 'react';

const SolutionSection = ({ currentQuestion }) => {
  const [activeSolution, setActiveSolution] = useState('optimal');
  const [solutions, setSolutions] = useState({
    optimal: { code: '', explanation: '' },
    alternative: { code: '', explanation: '' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [codingLanguage, setCodingLanguage] = useState('');

  // Extract the user's coding language from the button on the LeetCode page
  const fetchCodingLanguage = async () => {
    try {
      // Get the current tab's URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;

      // Ensure the tab is a LeetCode problem page
      if (!url.includes('leetcode.com/problems/')) {
        throw new Error('This is not a valid LeetCode problem page.');
      }

      // Execute a script in the context of the LeetCode page to extract the language
      const language = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const languageButton = document.querySelector('.rounded.items-center.whitespace-nowrap.focus\\:outline-none.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.dark\\:text-text-secondary.active\\:bg-transparent.dark\\:active\\:bg-dark-transparent.hover\\:bg-fill-secondary.dark\\:hover\\:bg-fill-secondary.px-1\\.5.py-0\\.5.text-sm.font-normal.group');
          return languageButton ? languageButton.textContent.trim() : null;
        },
      });

      if (language && language[0]?.result) {
        setCodingLanguage(language[0].result.toLowerCase()); // Normalize the language name
      } else {
        throw new Error('No language button found on the page.');
      }
    } catch (error) {
      console.error('Error fetching coding language:', error);
      setCodingLanguage('python'); // Fallback to Python
    }
  };

  // Fetch solutions from the AI
  const fetchSolutions = async () => {
    if (!codingLanguage) return; // Wait until the language is detected

    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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', // Replace with your valid Groq API key
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a helpful coding assistant. Provide an optimal and a suboptimal solution for the given LeetCode problem in ${codingLanguage}. For each solution, include the code and a brief explanation. Do not reveal the solution directly. Use the following format:

### Optimal Solution
[Explanation of the optimal approach]

\`\`\`
[${codingLanguage} code here]
\`\`\`

### Suboptimal Solution
[Explanation of the suboptimal approach]

\`\`\`
[${codingLanguage} code here]
\`\`\`
`,
            },
            {
              role: 'user',
              content: `Provide an optimal and a suboptimal solution for the problem: ${currentQuestion.title}`,
            },
          ],
          max_tokens: 1000, // Increase token limit for longer responses
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Groq API Response:', JSON.stringify(data, null, 2)); // Log the full response

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid API response format.');
      }

      const content = data.choices[0].message.content.trim();

      if (content) {
        // Parse the AI response to extract optimal and suboptimal solutions
        const optimalSolution = extractSolution(content, 'Optimal Solution');
        const alternativeSolution = extractSolution(content, 'Suboptimal Solution');

        setSolutions({
          optimal: optimalSolution,
          alternative: alternativeSolution,
        });
      } else {
        throw new Error('No solutions found in the API response.');
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
      setSolutions({
        optimal: { 
          code: `// Error: ${error.message}`, 
          explanation: 'Failed to fetch solutions. Please check your API key and try again.' 
        },
        alternative: { 
          code: `// Error: ${error.message}`, 
          explanation: 'Failed to fetch solutions. Please check your API key and try again.' 
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract solutions from the AI response
  const extractSolution = (content, solutionType) => {
    const startIndex = content.indexOf(solutionType);
    if (startIndex === -1) return { code: '', explanation: '' };

    const endIndex = content.indexOf('###', startIndex + 1); // Assuming solutions are separated by "###"
    const solutionContent = content.slice(startIndex, endIndex !== -1 ? endIndex : undefined);

    // Extract code block
    const codeMatch = solutionContent.match(/```[\s\S]*?```/);
    const code = codeMatch ? codeMatch[0].replace(/```/g, '').trim() : '';

    // Extract explanation (everything outside the code block)
    const explanation = solutionContent
      .replace(/```[\s\S]*?```/, '') // Remove code block
      .replace(solutionType, '') // Remove solution type heading
      .replace(/\n+/g, ' ') // Replace multiple newlines with a single space
      .trim();

    return { code, explanation };
  };

  // Fetch coding language when the component mounts
  useEffect(() => {
    fetchCodingLanguage();
  }, []);

  // Fetch solutions when the question or coding language changes
  useEffect(() => {
    if (currentQuestion.title && codingLanguage) {
      fetchSolutions();
    }
  }, [currentQuestion.title, codingLanguage]);

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 border border-zinc-800/60 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-zinc-300">Solution ({codingLanguage})</h3>
        <div className="flex text-xs rounded-lg overflow-hidden border border-zinc-700/60">
          <button 
            onClick={() => setActiveSolution('optimal')}
            className={`px-2 py-1 ${activeSolution === 'optimal' ? 'bg-purple-900/70 text-purple-300' : 'bg-zinc-800/70 text-zinc-400'}`}
          >
            Optimal
          </button>
          <button 
            onClick={() => setActiveSolution('alternative')}
            className={`px-2 py-1 ${activeSolution === 'alternative' ? 'bg-purple-900/70 text-purple-300' : 'bg-zinc-800/70 text-zinc-400'}`}
          >
            Alternative
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
          <p className="text-sm text-zinc-300">Loading {codingLanguage} solutions...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Code Block */}
          <div className="bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/30 max-h-32 overflow-auto">
            <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">
              {solutions[activeSolution].code || `// No ${codingLanguage} code available.`}
            </pre>
          </div>
          
          {/* Explanation */}
          <div className="bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/30 max-h-24 overflow-auto">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-zinc-300">
                {solutions[activeSolution].explanation || 'No explanation available.'}
              </p>
            </div>
          </div>
          
          {/* Complexity */}
          <div className="flex justify-between text-xs text-zinc-400">
            <div className="flex items-center">
              <span className="mr-1">Time:</span>
              <span className="text-green-400">
                {activeSolution === 'optimal' ? 'O(n)' : 'O(n log n)'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">Space:</span>
              <span className="text-blue-400">
                {activeSolution === 'optimal' ? 'O(n)' : 'O(1)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionSection;