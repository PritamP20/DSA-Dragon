import { generateCourseData, generateLeetCodeQuestion , npcDialogues, errorAndImprovements} from "./courseDataApi.js"

// const test = async () => {
//   const topic = "Binary Search Tree";
//   const data = await generateCourseData(topic);
//   console.log("Generated Course Data:", data);
// };
// const test = async () => {
//   const topic = "Binary Search Tree";
//   const difficulty =" easy"
//   const data = await generateLeetCodeQuestion(topic, difficulty);
//   console.log("Generated Course Data:", data);
// };
const test = async () => {
  const topic = `IndentationError: expected an indented block after 'for' statement on line 61
    import sys
Line 5  (Solution.py)`;
  // const difficulty =" easy"
  const data = await errorAndImprovements(topic);
  console.log("Generated Course Data:", data);
};

test();
