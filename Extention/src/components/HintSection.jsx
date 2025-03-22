import { useState, useEffect } from 'react';

const HintSection = ({ currentQuestion }) => {
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch AI-generated hints using the Groq API
  const fetchHints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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', // Replace with your Groq API key
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Use the appropriate Groq model
          messages: [
            {
              role: 'system',
              content: 'You are a helpful coding assistant. Provide a concise one-line hint for solving the given LeetCode problem.',
            },
            {
              role: 'user',
              content: `Provide a hint for solving the problem: ${currentQuestion.title}`,
            },
          ],
          max_tokens: 50, // Limit the response to one line
        }),
      });

      const data = await response.json();
      const hint = data.choices[0]?.message?.content?.trim();

      if (hint) {
        setHints([hint]); // Set the hint in the state
      } else {
        // If the API returns no hint, set an empty hint
        setHints([]);
      }
    } catch (error) {
      console.error('Error fetching hints:', error);
      // If the API call fails, set an empty hint
      setHints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch hints when "Show" is clicked
  useEffect(() => {
    if (showHints) {
      fetchHints();
    }
  }, [showHints]);

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 mb-3 border border-zinc-800/60 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-zinc-300">Hints</h3>
        <button 
          onClick={() => setShowHints(!showHints)}
          className="text-xs text-purple-400 hover:text-purple-300"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (showHints ? 'Hide' : 'Show')}
        </button>
      </div>
      
      {showHints ? (
        <div className="space-y-2">
          {hints.length > 0 ? (
            hints.map((hint, index) => (
              <div key={index} className="bg-zinc-800/40 p-2 rounded text-xs text-zinc-300 border border-zinc-700/30">
                <span className="text-purple-400 mr-1">Hint:</span> {hint}
              </div>
            ))
          ) : (
            <div className="bg-zinc-800/40 p-3 rounded text-center text-xs text-zinc-400 border border-zinc-700/30">
              No hints available for this problem.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-800/40 p-3 rounded text-center text-xs text-zinc-400 border border-zinc-700/30">
          Click "Show" to reveal hints for this problem
        </div>
      )}
    </div>
  );
};

export default HintSection;