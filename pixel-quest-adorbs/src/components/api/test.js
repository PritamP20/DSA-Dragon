import { generateCourseData, generateLeetCodeQuestion } from "./courseDataApi.js"

// const test = async () => {
//   const topic = "Binary Search Tree";
//   const data = await generateCourseData(topic);
//   console.log("Generated Course Data:", data);
// };
const test = async () => {
  const topic = "Binary Search Tree";
  const difficulty =" easy"
  const data = await generateLeetCodeQuestion(topic, difficulty);
  console.log("Generated Course Data:", data);
};

test();
