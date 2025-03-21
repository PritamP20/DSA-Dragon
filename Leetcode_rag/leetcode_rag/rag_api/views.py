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
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view

logger = logging.getLogger(__name__)
@swagger_auto_schema(
    method='post',
    request_body=ScrapeProblemSerializer,
    responses={
        201: ProblemSerializer,
        200: ProblemSerializer,
        400: 'Bad Request',
        500: 'Internal Server Error'
    },
    operation_description="Scrape a LeetCode problem description by container ID"
)
@api_view(['POST'])
def scrape_problem(request):
    """
    API endpoint to scrape a LeetCode problem description
    
    Provide a container_id to scrape a problem from LeetCode.com
    """
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
@swagger_auto_schema(
    method='post',
    request_body=CodeContentSerializer,
    responses={
        201: CodeSubmissionSerializer,
        400: 'Bad Request',
        404: 'Problem Not Found',
        500: 'Internal Server Error'
    },
    operation_description="Post code from the editor"
)
@api_view(['POST'])
def post_editor_content(request):
    """
    API endpoint to post editor content
    
    Accepts code from editor and stores it in the database
    """
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
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'container_id', 
            openapi.IN_QUERY, 
            description="Container ID of the problem", 
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: FlagResponseSerializer,
        400: 'Bad Request',
        404: 'Problem Not Found',
        500: 'Internal Server Error'
    },
    operation_description="Get a flag response based on code analysis"
)
@api_view(['GET'])
def get_flag_response(request):
    """
    API endpoint to get a flag response
    
    Returns feedback on code quality with randomized messages
    """
    container_id = request.query_params.get('container_id')
    
    if not container_id:
        return Response(
            {"error": "container_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        problem = Problem.objects.get(container_id=container_id)
        
        # Get the latest code submission for this problem
        latest_submission = CodeSubmission.objects.filter(
            problem=problem
        ).order_by('-created_at').first()
        
        if not latest_submission:
            return Response(
                {"error": "No code submissions found for this problem"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use the RAG to generate a flag response
        flag_response = llama_rag.get_flag_response(
            latest_submission.code_content, 
            problem.description
        )
        
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
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'container_id', 
            openapi.IN_QUERY, 
            description="Container ID of the problem", 
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description="Success",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'container_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'intuition': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: 'Bad Request',
        404: 'Problem Not Found',
        500: 'Internal Server Error'
    },
    operation_description="Get problem-solving intuition"
)
@api_view(['GET'])
def show_intuition(request):
    """
    API endpoint to show problem solving intuition
    
    Returns hints and approaches for solving the problem
    """
    container_id = request.query_params.get('container_id')
    
    if not container_id:
        return Response(
            {"error": "container_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
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
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'container_id', 
            openapi.IN_QUERY, 
            description="Container ID of the problem", 
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description="Success",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'container_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'solution': openapi.Schema(type=openapi.TYPE_STRING),
                }
            )
        ),
        400: 'Bad Request',
        404: 'Problem Not Found',
        500: 'Internal Server Error'
    },
    operation_description="Get full problem solution"
)
@api_view(['GET'])
def show_solution(request):
    """
    API endpoint to show problem solution
    
    Returns detailed solution with approach and code
    """
    container_id = request.query_params.get('container_id')
    
    if not container_id:
        return Response(
            {"error": "container_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
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