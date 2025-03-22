import model from "../api/model.js";

const map_video = {  
  'Array': [
    "https://www.youtube.com/watch?v=TQMvBTKn2p0", 
    "https://www.youtube.com/watch?v=8wmn7k1TTcI", 
    "https://www.youtube.com/watch?v=3_x_Fb31NLE"
  ],  
  'Linked List': [
    "https://www.youtube.com/watch?v=dqLHTK7RuIo", 
    "https://www.youtube.com/watch?v=N6dOwBde7-M", 
    "https://www.youtube.com/watch?v=LyuuqCVkP5I"
  ],  
  'Binary Search Trees': [
    "https://www.youtube.com/watch?v=EPwWrs8OtfI", 
    "https://www.youtube.com/watch?v=pYT9F8_LFTM", 
    "https://www.youtube.com/watch?v=cySVml6e_Fc"
  ]  
};



// "videoURL": "a youtube video about ${topic} which is a video in format https://www.youtube.com/watch?v=UR_CODE&ab_channel=CHANNEL_NAME ",


const generateCourseData = async (topic) => {
  // let video_url = "https://www.youtube.com/watch?v=TQMvBTKn2p0&t=469s&ab_channel=GregHogg";

  // if (map_video[topic]) {
  //     const randomIndex = Math.floor(Math.random() * map_video[topic].length);
  //     video_url = map_video[topic][randomIndex];
  // }

  const randomIndex = Math.floor(Math.random() * map_video[topic].length);
  let video_url = map_video[topic][randomIndex];

  console.log(video_url); // Logs a random video from the selected topic

  try {
    const prompt = `
Generate educational content for ${topic} in computer science algorithms.

Ensure the video is **highly relevant** to ${topic} and has good engagement

Format the response as valid JSON:
{
  "title": "Full title of the topic in 2 words",
  "subtitle": "An engaging subtitle for the topic in 3 words",
  "videoTitle": "A title for a highly relevant YouTube video 3 words",
  "videoURL": "${video_url} just send this url don't add anything extra",
  "thumbnailKey": "thumb-${topic}",
  "duration": "A realistic video duration",
  "channel": "One of the trusted channels above",
  "views": "A realistic view count with K/M suffix ",
  "concepts": [
    "4 key concepts about ${topic}, each starting with an emoji",
    "Each concept should be brief but insightful",
    "Focus on practical understanding",
    "Include Big O notation where relevant"
  ],
  "funFact": "An interesting or surprising fact about ${topic}",
  "xpReward": A number between 30 and 80 representing the complexity
}

Make sure the **YouTube URL is real** and **related to ${topic}**.
Return ONLY valid JSON with no additional text or explanation.
`;

    const result = await model.generateContent(prompt);
    // output = result.response.text();
    return result.response.text();
  } catch (err) {
    console.log(`Error generating conversation title:${err.message}`);
    console.log("All env vars:", import.meta.env);
    console.log();
  }
};

const generateLeetCodeQuestion = async (topic, difficulty) => {
  try {
    const prompt = `
Generate a realistic LeetCode-style algorithm question with ${topic} difficulty level ${difficulty}.

Format the response as valid JSON:
{
  "title": "A concise, descriptive title for the algorithm problem",
  "description": "A clear explanation of the problem, requirements, and constraints",
  "example": {
    "input": "Sample input for the Question",
    "output": "Expected output for the given input",
    "explanation": "Dry run of the Example Test case"
  },
  "difficulty": "${difficulty}",
  "tags": ${topic} related tags,
  "hints": ["A helpful hint without giving away the solution", "Another hint if needed"],
  "testcases": Generate 4 Test cases to validate in this json format example { id: 2, input: "[-1, -2, 10]", expectedOutput: "7", active: true }
}

Return ONLY valid JSON with no additional text or explanation.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.log(`Error generating LeetCode question: ${err.message}`);
    console.log("All env vars:", import.meta.env);
    return null;
  }
};

const npcDialogues = async (topic) => {
  try {
    const prompt = `You are a 2D npc character of a game, generate a random fact about the ${topic} in a one short line.
    Example: Just like how a dictionary allows quick lookups, HashMaps in programming provide efficient key-value pair searching!
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.log(`Error generating Leetcode Question: ${err.message}`);
    console.log("All env vars:", import.meta.env);
    return null;
  }
};

const errorAndImprovements = async (problem_statement, code_snippet, err_log) => {
  try {
    const prompt = `Analyze the following code and provide structured feedback in JSON format and can you add come emoji in analyisi and imrpovements to motivate.
    ${problem_statement}
    ${code_snippet}
    ${err_log}
    Do not Generate Markdown Content!
    Expected JSON Output:
{
  "overview": {
    "score": "An integer score out of 100 based on efficiency, clarity, and correctness",
    "complexity": "The overall time complexity (e.g., 'O(n log n)')",
    "status": "One of ['Passing', 'Needs Improvement', 'Failing'] based on correctness and efficiency",
    "strengths": [
      "List 3-4 key strengths of the code, such as good variable naming, clear logic, or optimal performance"
    ],
    "weaknesses": [
      "List 2-4 key weaknesses, such as potential inefficiencies, missing edge case handling, or redundant computations"
    ]
  },
  "analysis": [
    {
      "lineNumber": "The line number where the issue occurs",
      "severity": "One of ['suggestion', 'warning', 'improvement', 'error']",
      "message": "A concise explanation of the issue",
      "code": "The problematic or relevant line of code"
    }
  ],
  "alternatives": [
    {
      "title": "A better approach (e.g., 'Hash Map Approach')",
      "complexity": "The time complexity of this approach (e.g., 'O(n)')",
      "description": "A short explanation of why this approach is better",
      "snippet": "A short code snippet showcasing the alternative approach"
    }
  ]
}

### Additional Notes:
- The feedback should be **constructive and actionable**.
- Prioritize **efficiency, clarity, and edge case handling**.
- Include **alternative implementations** if a better solution exists.
- Keep explanations concise but informative.

Return ONLY valid JSON with NO extra text.

    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.log(`Error generating error Improvemnets: ${err.message}`);
    console.log("All env vars:", import.meta.env);
    return null;
  }
};

const Codechatbot = async(input) => {
  try {
    const prompt = `You are a AI Coding Assistant, help users with coding related problems and related to what the user Asks you, give concise response related to the topic in the above message and no Markdown response! 
    ${input}`;
    
    const airesponse = await model.generateContent(prompt);
    return airesponse.response.text();
  } catch(err) {
    console.log(`Error generating response: ${err.message}`);
    console.log("All env vars:", import.meta.env);
    return null;
  }
};


export {
  generateCourseData,
  generateLeetCodeQuestion,
  npcDialogues,
  errorAndImprovements,
  map_video,
  Codechatbot,
};
