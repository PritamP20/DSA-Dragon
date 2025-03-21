// // courseDataAPI.js
// import { getAiResponse } from "../api/botresponse.js";
// import express from 'express';
// import cors from 'cors';

// const app = express();
// app.use(express.json());
// app.use(cors());

// // In-memory cache for course data
// const courseCache = {};

// // Valid topics list
// const VALID_TOPICS = [
//   'bst', 'dynamic', 'graphs', 'sorting', 'recursion', 
//   'hashtables', 'heaps', 'linkedlists', 'queues', 'stacks'
// ];

// // Default course data for fallback
// const DEFAULT_COURSE = {
//   title: 'Algorithm Basics',
//   subtitle: 'Start your algorithm journey',
//   videoTitle: 'Introduction to Algorithms and Data Structures',
//   videoURL: 'https://www.youtube.com/watch?v=8hly31xKli0',
//   thumbnailKey: 'thumb-default',
//   duration: '7:20',
//   channel: 'CodeCraft',
//   views: '5K',
//   concepts: [
//     '📝 Algorithms are step-by-step procedures for solving problems',
//     '🧮 Time and space complexity measure efficiency',
//     '🔍 Different problems require different algorithmic approaches',
//     '🔄 Iteration and recursion are two fundamental approaches'
//   ],
//   funFact: 'The word "algorithm" comes from the name of Persian mathematician Al-Khwarizmi!',
//   xpReward: 30
// };

// // Helper function to generate course data using your existing Gemini setup
// async function generateCourseData(topic) {
//   try {
//     const prompt = `
//       Generate educational content for ${topic} in computer science algorithms. 
//       Format the response as valid JSON with these fields:
//       {
//         "title": "Full title of the topic",
//         "subtitle": "An engaging subtitle for the topic",
//         "videoTitle": "A title for a hypothetical educational video",
//         "videoURL": "A placeholder YouTube URL starting with https://www.youtube.com/watch?v=",
//         "thumbnailKey": "thumb-${topic}",
//         "duration": "A realistic video duration (e.g., '8:42')",
//         "channel": "A creative channel name related to the topic",
//         "views": "A realistic view count with K suffix (e.g., '15K')",
//         "concepts": [
//           "4 key concepts about ${topic}, each starting with an emoji",
//           "Each concept should be brief but insightful",
//           "Focus on practical understanding",
//           "Include Big O notation where relevant"
//         ],
//         "funFact": "An interesting or surprising fact about ${topic}",
//         "xpReward": A number between 30 and 80 representing the complexity
//       }
      
//       Make the content engaging, educational, and avoid markdown formatting.
//       Return ONLY valid JSON with no additional text or explanation.
//     `;

//     // Use your existing getAiResponse function
//     const response = await getAiResponse(prompt);
    
//     // Parse JSON response
//     let courseData;
//     try {
//       // Try to parse the raw response
//       courseData = JSON.parse(response);
//     } catch (e) {
//       // If direct parsing fails, try to extract JSON from text
//       const jsonMatch = response.match(/{[\s\S]*}/);
//       if (jsonMatch) {
//         courseData = JSON.parse(jsonMatch[0]);
//       } else {
//         throw new Error("Failed to parse AI response as JSON");
//       }
//     }
    
//     return courseData;
//   } catch (error) {
//     console.error("Error generating course data:", error);
//     throw error;
//   }
// }

// async function generateCourseData(topic){
//   const result = await model.generateContent(prompt);
// const responseText = result.response.text(); // Raw response from Gemini
// console.log("Raw Gemini Response:", responseText);
// }

// // API endpoint to get course data
// app.get('/api/course/:topic', async (req, res) => {
//   try {
//     const { topic } = req.params;
    
//     // Validate the topic
//     if (!VALID_TOPICS.includes(topic)) {
//       return res.json(DEFAULT_COURSE);
//     }
    
//     // Check cache for existing data
//     if (courseCache[topic]) {
//       return res.json(courseCache[topic]);
//     }
    
//     // Generate new course data
//     const courseData = await generateCourseData(topic);
    
//     // Save to cache
//     courseCache[topic] = courseData;
    
//     res.json(courseData);
//   } catch (error) {
//     console.error("API error:", error);
//     res.status(500).json({ 
//       error: "Failed to retrieve course data",
//       message: error.message 
//     });
//   }
// });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'API is running' });
// });

// // Clear cache endpoint (for testing)
// app.post('/api/clearCache', (req, res) => {
//   Object.keys(courseCache).forEach(key => delete courseCache[key]);
//   res.json({ message: 'Cache cleared successfully' });
// });

// // Start the server
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Course data API running on port ${PORT}`);
// });

// export default app;



import model from "../api/model.js";

const generateCourseData = async(topic)=>{
  try{
    const prompt =`
    Generate educational content for ${topic} in computer science algorithms. 
    Format the response as valid JSON with these fields:
    {
      "title": "Full title of the topic",
      "subtitle": "An engaging subtitle for the topic",
      "videoTitle": "A title for a hypothetical educational video",
      "videoURL": "A placeholder YouTube URL starting with https://www.youtube.com/watch?v=",
      "thumbnailKey": "thumb-${topic}",
      "duration": "A realistic video duration (e.g., '8:42')",
      "channel": "A creative channel name related to the topic",
      "views": "A realistic view count with K suffix (e.g., '15K')",
      "concepts": [
        "4 key concepts about ${topic}, each starting with an emoji",
        "Each concept should be brief but insightful",
        "Focus on practical understanding",
        "Include Big O notation where relevant"
      ],
      "funFact": "An interesting or surprising fact about ${topic}",
      "xpReward": A number between 30 and 80 representing the complexity
    }
    
    Make the content engaging, educational, and avoid markdown formatting.
    Return ONLY valid JSON with no additional text or explanation.`;
    const result = await model.generateContent(
      prompt
    );
    // output = result.response.text();
    return result.response.text();
  }
  catch(err){
    console.log(`Error generating conversation title:${err.message}`);
      console.log("All env vars:", import.meta.env);
      console.log()
  }
};


export {generateCourseData};
