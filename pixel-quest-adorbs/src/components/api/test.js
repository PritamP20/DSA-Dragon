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

  const problem_statement = "write a for loop to print number from 0 to 5"
  const error_log = `IndentationError: expected an indented block after 'for' statement on line 61
          import sys
Line 5  (Solution.py)`;

  const code_snippet = `for i in range(0,5):
                        print(i)
                          `
  // const difficulty =" easy"
  const data = await errorAndImprovements(problem_statement,code_snippet,error_log);
  console.log("Generated Course Data:", data);
};

test();
