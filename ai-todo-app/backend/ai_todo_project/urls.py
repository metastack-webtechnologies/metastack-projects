from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static # Import static for media files in debug mode

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')), # Include your tasks app's URLs under /api/
]

# Serve media files only in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)