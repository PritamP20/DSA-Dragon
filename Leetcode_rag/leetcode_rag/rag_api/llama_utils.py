import os
import torch
import random
from langchain_community.llms import HuggingFacePipeline
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

# Path to store vector database
VECTOR_DB_PATH = "vector_db"

class LlamaRAG:
    def __init__(self):
        self.model = None
        self.embeddings = None
        self.vectorstore = None
        self.qa_chain = None
        self.initialized = False
        
    def initialize(self):
        """Initialize the Llama model and embeddings"""
        if self.initialized:
            return
            
        try:
            # Initialize embeddings model for vectorstore
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-mpnet-base-v2"
            )
            
            # Initialize Llama 3.2 model 
            model_id = "meta-llama/Llama-3.2-8B-Instruct"  # Using 8B version for better performance
            tokenizer = AutoTokenizer.from_pretrained(model_id)
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
                device_map="auto",
                load_in_8bit=True  # Quantization for memory efficiency
            )
            
            # Create text generation pipeline
            llama_pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.95,
                repetition_penalty=1.15
            )
            
            # Create LangChain wrapper around the pipeline
            self.model = HuggingFacePipeline(pipeline=llama_pipeline)
            
            # Try to load existing vectorstore if it exists
            if os.path.exists(VECTOR_DB_PATH):
                self.vectorstore = FAISS.load_local(VECTOR_DB_PATH, self.embeddings)
            else:
                # Create empty vectorstore if none exists
                self.vectorstore = FAISS.from_texts(["RAG initialization"], self.embeddings)
                
            # Create QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.model,
                chain_type="stuff",
                retriever=self.vectorstore.as_retriever()
            )
            
            self.initialized = True
        except Exception as e:
            print(f"Failed to initialize Llama RAG: {str(e)}")
            raise
            
    def update_knowledge(self, problem_description, code_content):
        """Update RAG knowledge base with problem description and code"""
        self.initialize()
        
        # Combine problem description and code content
        content = f"PROBLEM:\n{problem_description}\n\nCODE:\n{code_content}"
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_text(content)
        
        # Add chunks to vectorstore
        self.vectorstore.add_texts(chunks)
        
        # Save updated vectorstore
        self.vectorstore.save_local(VECTOR_DB_PATH)
        
    def get_flag_response(self, code_snippet, problem_description):
        """Generate a flag response based on code snippet and problem"""
        self.initialize()
        
        # Define response categories
        responses = {
            "right": ["You're headed in the right way", "Hmmm, that might work", "Looking good so far", "That's a promising approach"],
            "wrong": ["Not quite there yet", "Try another way", "This approach has issues", "You might need to reconsider"],
            "totally_off": ["Nah that won't work", "You're on the wrong track", "That's not going to solve it", "That's a complete misdirection"]
        }
        
        # Construct a prompt for the model
        prompt = f"""
        You are a coding assistant that analyzes code for LeetCode problems.
        
        PROBLEM DESCRIPTION:
        {problem_description}
        
        CODE SNIPPET:
        {code_snippet}
        
        Based on the code snippet and problem description, determine if the approach is:
        1. RIGHT: The approach seems correct and likely to work
        2. WRONG: The approach has issues but is somewhat on the right track
        3. TOTALLY OFF: The approach is completely incorrect
        
        Respond with ONLY ONE of these categories: RIGHT, WRONG, or TOTALLY OFF
        """
        
        try:
            # Get response from model
            response = self.model(prompt)
            
            # Determine category based on model response
            response_lower = response.lower()
            if "right" in response_lower:
                category = "right"
            elif "wrong" in response_lower and "totally" not in response_lower:
                category = "wrong"
            else:
                category = "totally_off"
                
            # Select random response from the category
            message = random.choice(responses[category])
            
            return {
                "message": message,
                "category": category
            }
        except Exception as e:
            print(f"Error generating flag response: {str(e)}")
            # Fallback to random response
            category = random.choice(list(responses.keys()))
            return {
                "message": random.choice(responses[category]),
                "category": category
            }
            
    def generate_intuition(self, container_id, problem_description):
        """Generate intuition for solving the problem"""
        self.initialize()
        
        prompt = f"""
        You are a coding tutor helping with LeetCode problems.
        
        PROBLEM:
        {problem_description}
        
        Provide a clear intuition for how to approach this problem. Focus on:
        1. Understanding the problem
        2. Key observations
        3. Possible approaches (without giving away the full solution)
        4. Trade-offs between approaches
        
        Format your response in a helpful, educational way that guides the student without solving it for them.
        """
        
        try:
            response = self.qa_chain({"query": prompt})
            return response["result"]
        except Exception as e:
            print(f"Error generating intuition: {str(e)}")
            return "I'm having trouble generating an intuition for this problem. Please try again later."
    
    def generate_solution(self, container_id, problem_description):
        """Generate a complete solution for the problem"""
        self.initialize()
        
        prompt = f"""
        You are a coding expert solving a LeetCode problem.
        
        PROBLEM:
        {problem_description}
        
        Provide a complete solution to this problem, including:
        1. A clear explanation of the approach
        2. Time and space complexity analysis
        3. Step-by-step walkthrough of the algorithm
        4. Working code implementation
        5. Example execution trace
        
        Format your response in a well-structured, educational way that helps understand both the solution and the underlying concepts.
        """
        
        try:
            response = self.qa_chain({"query": prompt})
            return response["result"]
        except Exception as e:
            print(f"Error generating solution: {str(e)}")
            return "I'm having trouble generating a solution for this problem. Please try again later."

# Singleton instance
llama_rag = LlamaRAG()