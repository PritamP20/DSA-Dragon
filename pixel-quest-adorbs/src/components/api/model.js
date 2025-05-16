import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAzCmPQySbZMuzBXkkWDAQXfkssuvYnxA8");

const model = genAI.getGenerativeModel({model:'gemini-2.0-flash'});

export default model;