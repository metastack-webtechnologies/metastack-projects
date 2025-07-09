from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__' # Include all fields from the Task model
        read_only_fields = ('created_at', 'last_modified_at',) # These fields are set automatically by Django
        # If you were to add a user field later, you might add 'user' here as well.