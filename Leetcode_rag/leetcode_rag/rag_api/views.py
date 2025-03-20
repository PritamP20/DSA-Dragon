from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import (
    ProblemSerializer, 
    CodeSubmissionSerializer, 
    ScrapeProblemSerializer,
    CodeContentSerializer,
    FlagResponseSerializer
)
from .models import Problem, CodeSubmission
from .scraper import scrape_leetcode_problem
from .llama_utils import llama_rag
import random
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def scrape_problem(request):
    """API endpoint to scrape a LeetCode problem description"""
    serializer = ScrapeProblemSerializer(data=request.data)
    
    if serializer.is_valid():
        container_id = serializer.validated_data['container_id']
        
        # Check if we already have this problem in the database
        try:
            problem = Problem.objects.get(container_id=container_id)
            return Response(
                ProblemSerializer(problem).data,
                status=status.HTTP_200_OK
            )
        except Problem.DoesNotExist:
            # Scrape the problem from LeetCode
            try:
                problem_data = scrape_leetcode_problem(container_id)
                
                # Create a new problem in the database
                problem = Problem.objects.create(
                    container_id=container_id,
                    title=problem_data['title'],
                    description=problem_data['description']
                )
                
                return Response(
                    ProblemSerializer(problem).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Error scraping problem: {str(e)}")
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def post_editor_content(request):
    """API endpoint to post editor content"""
    serializer = CodeContentSerializer(data=request.data)
    
    if serializer.is_valid():
        container_id = serializer.validated_data['container_id']
        code_content = serializer.validated_data['code_content']
        
        try:
            problem = Problem.objects.get(container_id=container_id)
            
            # Create a new code submission
            submission = CodeSubmission.objects.create(
                problem=problem,
                code_content=code_content
            )
            
            # Update RAG knowledge base
            llama_rag.update_knowledge(problem.description, code_content)
            
            return Response(
                CodeSubmissionSerializer(submission).data,
                status=status.HTTP_201_CREATED
            )
        except Problem.DoesNotExist:
            return Response(
                {"error": f"Problem with container_id {container_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error saving editor content: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def get_flag_response(request):
    """API endpoint to get a flag response"""
    serializer = CodeContentSerializer(data=request.data)
    
    if serializer.is_valid():
        container_id = serializer.validated_data['container_id']
        code_content = serializer.validated_data['code_content']
        
        try:
            problem = Problem.objects.get(container_id=container_id)
            
            # Use the RAG to generate a flag response
            flag_response = llama_rag.get_flag_response(code_content, problem.description)
            
            return Response(
                {
                    "container_id": container_id,
                    "message": flag_response["message"],
                    "category": flag_response["category"]
                },
                status=status.HTTP_200_OK
            )
        except Problem.DoesNotExist:
            return Response(
                {"error": f"Problem with container_id {container_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating flag response: {str(e)}")
            # Fallback to random response
            categories = ["right", "wrong", "totally_off"]
            responses = {
                "right": ["You're headed in the right way", "Hmmm, that might work"],
                "wrong": ["Not quite there yet", "Try another way"],
                "totally_off": ["Nah that won't work", "You're on the wrong track"]
            }
            
            category = random.choice(categories)
            message = random.choice(responses[category])
            
            return Response(
                {
                    "container_id": container_id,
                    "message": message,
                    "category": category
                },
                status=status.HTTP_200_OK
            )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def show_intuition(request):
    """API endpoint to show problem solving intuition"""
    serializer = ScrapeProblemSerializer(data=request.data)
    
    if serializer.is_valid():
        container_id = serializer.validated_data['container_id']
        
        try:
            problem = Problem.objects.get(container_id=container_id)
            
            # Generate intuition using RAG
            intuition = llama_rag.generate_intuition(container_id, problem.description)
            
            return Response(
                {
                    "container_id": container_id,
                    "intuition": intuition
                },
                status=status.HTTP_200_OK
            )
        except Problem.DoesNotExist:
            return Response(
                {"error": f"Problem with container_id {container_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating intuition: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def show_solution(request):
    """API endpoint to show problem solution"""
    serializer = ScrapeProblemSerializer(data=request.data)
    
    if serializer.is_valid():
        container_id = serializer.validated_data['container_id']
        
        try:
            problem = Problem.objects.get(container_id=container_id)
            
            # Generate solution using RAG
            solution = llama_rag.generate_solution(container_id, problem.description)
            
            return Response(
                {
                    "container_id": container_id,
                    "solution": solution
                },
                status=status.HTTP_200_OK
            )
        except Problem.DoesNotExist:
            return Response(
                {"error": f"Problem with container_id {container_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error generating solution: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )