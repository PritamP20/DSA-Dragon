import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAscNWq0hJD2yvzM_j4YjnD8-XcYWmMGn4");

const model = genAI.getGenerativeModel({model:'gemini-2.0-flash'});

export default model;