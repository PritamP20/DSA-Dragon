import { generateCourseData } from "./courseDataApi.js"

const test = async () => {
  const topic = "Sorting Algorithms";
  const data = await generateCourseData(topic);
  console.log("Generated Course Data:", data);
};

test();
