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
    container_id = serializers.CharField(max_length=100)

class CodeContentSerializer(serializers.Serializer):
    container_id = serializers.CharField(max_length=100)
    code_content = serializers.CharField()

class FlagResponseSerializer(serializers.Serializer):
    container_id = serializers.CharField(max_length=100)
    message = serializers.CharField()
    category = serializers.CharField()