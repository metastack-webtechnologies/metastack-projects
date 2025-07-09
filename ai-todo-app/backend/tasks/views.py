from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
# NEW: Import MultiPartParser, FormParser for file uploads
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer
# NEW: Import transcribe_audio for self-hosted STT
from .ai_integration import prioritize_task_with_ai, transcribe_audio
import asyncio
from datetime import datetime, date, timedelta

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    # Allow JSON for text input from web/mobile, and multipart/form-data for audio uploads from React Native
    parser_classes = (JSONParser, MultiPartParser, FormParser) # <-- CORRECTED PARSER CLASSES
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'status']

    # Override list method to handle custom date filters
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset() # Start with the base queryset

        # Apply custom date filters based on query parameters
        date_filter = request.query_params.get('date_filter', 'All')

        if date_filter != 'All':
            today = date.today()
            if date_filter == 'Today':
                queryset = queryset.filter(due_date=today)
            elif date_filter == 'Future':
                queryset = queryset.filter(due_date__gt=today) # Greater than today (i.e., tomorrow or later)
            elif date_filter == 'Past':
                queryset = queryset.filter(due_date__lt=today) # Less than today (i.e., yesterday or earlier)
            # Note: This will only filter tasks that *have* a due_date. Tasks with null due_date are excluded.

        # Apply default category and status filters from filterset_fields
        # DjangoFilterBackend will automatically apply these if corresponding params are present in request.query_params
        filtered_queryset = self.filter_queryset(queryset) # Applies filters from filterset_fields

        # Serialize the filtered queryset
        serializer = self.get_serializer(filtered_queryset, many=True)
        return Response(serializer.data)


    # Overridden create method to handle both text and audio inputs
    def create(self, request, *args, **kwargs):
        task_text = None
        audio_file = request.FILES.get('audio') # Attempt to get audio file from multipart/form-data

        if audio_file:
            # If audio file is present, transcribe it using self-hosted Whisper
            try:
                # audio_file.read() returns bytes, audio_file.content_type is the MIME type
                task_text = asyncio.run(transcribe_audio(audio_file.read(), audio_file.content_type))
            except Exception as e:
                print(f"Error during audio transcription: {e}")
                return Response(
                    {"detail": f"Audio transcription failed: {e}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not task_text or task_text.strip() == "":
                return Response(
                    {"detail": "Could not extract valid text from audio."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Otherwise, get text from request data (for text input from web/mobile)
            task_text = request.data.get('text')

        if not task_text or not task_text.strip():
            return Response(
                {"detail": "Task text or audio file is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # AI Prioritization (using local spaCy)
        ai_priority = 'None'
        ai_due_date = None
        try:
            ai_result = asyncio.run(prioritize_task_with_ai(task_text))
            ai_priority = ai_result.get('priority', 'None')
            ai_due_date = ai_result.get('dueDate', None)
        except Exception as e:
            print(f"AI prioritization failed: {e}. Defaulting to 'Medium'.")
            ai_priority = 'Medium'
            ai_due_date = None

        # Construct task data for serializer
        task_data = {
            'text': task_text,
            'priority': request.data.get('priority', ai_priority),
            'due_date': request.data.get('due_date', ai_due_date),
            'status': request.data.get('status', 'pending'),
            'category': request.data.get('category', 'Personal'), # Category from request or default
            # 'user': request.user.id # Uncomment and ensure user is available if authentication is implemented
        }

        serializer = self.get_serializer(data=task_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        text_updated = request.data.get('text')

        if text_updated and text_updated != instance.text:
            try:
                ai_result = asyncio.run(prioritize_task_with_ai(text_updated))
                request.data['priority'] = request.data.get('priority', ai_result.get('priority'))
                request.data['due_date'] = request.data.get('due_date', ai_result.get('dueDate'))
            except Exception as e:
                print(f"AI re-prioritization on update failed: {e}")

        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def pending(self, request, pk=None):
        task = self.get_object()
        task.status = 'pending'
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)