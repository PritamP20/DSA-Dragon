import model from "../api/model.js";

const generateCourseData = async (topic) => {
  try {
    const prompt = `
Generate educational content for ${topic} in computer science algorithms.

Ensure the video is **highly relevant** to ${topic} and has good engagement

Format the response as valid JSON:
{
  "title": "Full title of the topic in 2 words",
  "subtitle": "An engaging subtitle for the topic in 3 words",
  "videoTitle": "A title for a highly relevant YouTube video 3 words",
  "videoURL": "a youtube video about ${topic} which is a video in format https://www.youtube.com/watch?v=UR_CODE&ab_channel=CHANNEL_NAME ",
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
    return result.response.text()
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
  "testcases": Generate 4 Test cases to validate
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





export { generateCourseData , generateLeetCodeQuestion};
