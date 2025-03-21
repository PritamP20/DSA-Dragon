from django.urls import path
from . import views

urlpatterns = [
    path('scrape-problem/', views.scrape_problem, name='scrape-problem'),
    path('editor-content/', views.post_editor_content, name='post-editor-content'),
    path('flag-response/', views.get_flag_response, name='flag-response'),
    path('show-intuition/', views.show_intuition, name='show-intuition'),
    path('show-solution/', views.show_solution, name='show-solution'),
]