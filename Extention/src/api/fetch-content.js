/**
 * Extracts the problem slug from a LeetCode URL.
 * @param {string} url - The LeetCode problem URL.
 * @returns {string} - The problem slug (e.g., "two-sum").
 */
export const extractProblemSlug = (url) => {
	if (!url.includes("leetcode.com/problems/")) {
	  throw new Error("This is not a valid LeetCode problem page.");
	}
  
	// Extract the problem slug from the URL
	const problemSlug = url.split("/").filter(Boolean).pop();
	console.log("Extracted Problem Slug:", problemSlug);
  
	return problemSlug;
  };
  
  /**
   * Fetches LeetCode problem details using the official GraphQL API.
   * @param {string} problemSlug - The slug of the problem (e.g., "two-sum").
   * @returns {Promise<Object>} - The problem details (questionId, title, difficulty).
   */
  export const fetchLeetCodeProblemDetails = async (problemSlug) => {
	try {
	  // GraphQL query to fetch problem details
	  const query = `
		query getQuestionDetail($titleSlug: String!) {
		  question(titleSlug: $titleSlug) {
			questionId
			title
			difficulty
		  }
		}
	  `;
  
	  // Variables for the GraphQL query
	  const variables = { titleSlug: problemSlug };
  
	  // Send a POST request to the LeetCode GraphQL API
	  const response = await fetch("https://leetcode.com/graphql", {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
	  });
  
	  // Parse the response JSON
	  const responseData = await response.json();
  
	  // Extract the question data
	  const question = responseData.data.question;
  
	  if (!question) {
		throw new Error("Problem not found in the API response.");
	  }
  
	  // Return the problem details
	  return {
		questionId: question.questionId,
		title: question.title,
		difficulty: question.difficulty,
	  };
	} catch (error) {
	  console.error("Error fetching problem details:", error);
	  throw error;
	}
  };