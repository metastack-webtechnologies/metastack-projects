import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
# This line ensures .env file from the 'backend' directory is loaded
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY') # Get from .env

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True' # Get from .env, convert string to boolean

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') # Get from .env

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',        # Add Django REST Framework
    'corsheaders',           # Add Django CORS Headers
    'tasks',                 # Add your new tasks app
    'django_filters',        # Add Django Filters
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Add CORS middleware, preferably very high
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ai_todo_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ai_todo_project.wsgi.application'
ASGI_APPLICATION = 'ai_todo_project.asgi.application' # Enable ASGI for async views

# Database configuration
# Get from .env using dj-database-url for flexibility
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3') # Default to SQLite if env var not set
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL)
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata' # Set to your local time zone

USE_I18N = True

USE_TZ = True # Use timezone-aware datetimes for models


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Collect static files here for production

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') # Where uploaded user files (like audio) will be stored

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', # Allow unauthenticated access for now
        # 'rest_framework.permissions.IsAuthenticated', # Uncomment later for auth
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser', # Essential for JSON data
        'rest_framework.parsers.MultiPartParser', # <-- UNCOMMENTED/ADDED FOR FILE UPLOADS
        'rest_framework.parsers.FormParser',      # <-- UNCOMMENTED/ADDED FOR FILE UPLOADS
    ],
    # 'DEFAULT_AUTHENTICATION_CLASSES': [ # Uncomment later for auth
    #     'rest_framework.authentication.TokenAuthentication',
    # ],
}

# NEW: Default File Storage (important for handling uploaded files)
# This is Django's default, but good to be explicit.
# For production, you'd use django-storages for S3/GCS.
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'


# CORS Headers settings
CORS_ALLOW_ALL_ORIGINS = False # Set to False for production, then use CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') # Get from .env