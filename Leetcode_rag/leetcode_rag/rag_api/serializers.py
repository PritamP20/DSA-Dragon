
from rest_framework import serializers
from .models import Problem, CodeSubmission

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['id', 'container_id', 'title', 'description', 'created_at']

class CodeSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSubmission
        fields = ['id', 'problem', 'code_content', 'created_at']
        
class ScrapeProblemSerializer(serializers.Serializer):
    container_id = serializers.CharField(
        max_length=100,
        help_text="LeetCode problem identifier (e.g., 'two-sum', 'valid-parentheses')"
    )

class CodeContentSerializer(serializers.Serializer):
    container_id = serializers.CharField(
        max_length=100,
        help_text="LeetCode problem identifier (e.g., 'two-sum', 'valid-parentheses')"
    )
    code_content = serializers.CharField(
        help_text="Code content submitted by the user"
    )

class FlagResponseSerializer(serializers.Serializer):
    container_id = serializers.CharField(
        max_length=100,
        help_text="LeetCode problem identifier"
    )
    message = serializers.CharField(
        help_text="Feedback message about the code"
    )
    category = serializers.CharField(
        help_text="Category of the response (right, wrong, totally_off)"
    )