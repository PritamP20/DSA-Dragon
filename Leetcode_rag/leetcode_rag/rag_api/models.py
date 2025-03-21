from django.db import models

class Problem(models.Model):
    container_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.container_id}: {self.title}"

class CodeSubmission(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    code_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Submission for {self.problem.container_id} at {self.created_at}"

class FlagResponse(models.Model):
    CATEGORY_CHOICES = [
        ('right', 'Right'),
        ('wrong', 'Wrong'),
        ('totally_off', 'Totally Off'),
    ]
    
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='flag_responses')
    message = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.category} response for {self.problem.container_id}"

class Intuition(models.Model):
    problem = models.OneToOneField(Problem, on_delete=models.CASCADE, related_name='intuition')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Intuition for {self.problem.container_id}"

class Solution(models.Model):
    problem = models.OneToOneField(Problem, on_delete=models.CASCADE, related_name='solution')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Solution for {self.problem.container_id}"
