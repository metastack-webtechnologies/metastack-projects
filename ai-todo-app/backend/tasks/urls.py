from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

# Create a router for your ViewSets
router = DefaultRouter()
router.register(r'tasks', TaskViewSet) # This will create URL patterns like /tasks/, /tasks/{id}/

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]