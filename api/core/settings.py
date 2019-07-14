"""
Django settings for dcms project.

Generated by 'django-admin startproject' using Django 1.11.1.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import datetime
from django.utils.log import DEFAULT_LOGGING

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG')
EMAIL_ENABLE = os.environ.get('EMAIL_ENABLE')

PROTOCOL = 'https'
DOMAIN = os.environ.get('DOMAIN')
ALLOWED_HOSTS = [DOMAIN, '127.0.0.1']

APP_TITLE = os.environ.get('APP_TITLE')
APP_DESCRTIPTION = os.environ.get('APP_DESCRTIPTION')

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BASE_URL = PROTOCOL + '://' + DOMAIN + '/'
BASE_URL_TRIM = PROTOCOL + '://' + DOMAIN

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

APPEND_SLASH = True

# Application definition

REQUIRED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_swagger',
    'rest_auth',
]

PROJECT_APPS = [
    'utils',
    'apps.variable',
    'apps.group',
    'apps.category',
    'apps.staff',
    'apps.customer',
    'apps.article',
    'apps.area',
    'apps.address',
    'apps.rate',
    'apps.order',
    'apps.order_item',
    'apps.order_fee',
    'apps.delivery_fee',
    'apps.count_check',
    'apps.bol',
    'apps.bag',
    'apps.sr',
]

INSTALLED_APPS = REQUIRED_APPS + PROJECT_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

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
                'utils.context_processors.template_global.vars',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
        'TEST': {
            'NAME': os.environ.get('DB_TEST'),
        },
    },
}

# Email

EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = os.environ.get('EMAIL_PORT')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS')
DEFAULT_FROM_EMAIL = '"{}"<{}>'.format(APP_TITLE, EMAIL_HOST_USER)

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.BCryptPasswordHasher',
]

# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

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


REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'utils.common_classes.custom_pagination.CustomPagination',
    'PAGE_SIZE': 10,
    'NON_FIELD_ERRORS_KEY': 'detail',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
}

SWAGGER_SETTINGS = {
    'LOGIN_URL': '/dadmin/login',
    'SECURITY_DEFINITIONS': {
        'api_key': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    }
}

JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=3),
    'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=3),
    'JWT_ALLOW_REFRESH': True,
    'JWT_RESPONSE_PAYLOAD_HANDLER': 'utils.helpers.res_tools.jwt_response_payload_handler',
}

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

# TIME_ZONE = env.TIME_ZONE

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_ROOT = BASE_DIR + '/public/static/'
MEDIA_ROOT = BASE_DIR + '/public/media/'

STATIC_URL = BASE_URL + 'public/static/'
STATIC_IMG_URL = BASE_URL + 'public/static/images/'
MEDIA_URL = BASE_URL + 'public/media/'
CLIENT_URL = BASE_URL + '/public/clients/front/'
DEFAULT_IMG = 'default-thumbnail.jpg'
# User defined constants

ALLOW_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
PAGE_SIZE = 25
MAX_UPLOAD_SIZE = 3145728
MAX_IMAGE_SIZE = 1680
GOLDEN_RATIO = 1.618

TIME_ZONE = 'Asia/Saigon'
IMAGE_MAX_WIDTH = 1200
IMAGE_THUMBNAIL_WIDTH = 300
IMAGE_RATIO = 1.618
UPLOAD_MAX_SIZE = 4

DEFAULT_RATE = 3600
DEFAULT_REAL_RATE = 3456
DEFAULT_ORDER_FEE_FACTOR = 5
DEFAULT_DELIVERY_MASS_UNIT_PRICE = 25000
DEFAULT_DELIVERY_VOLUME_UNIT_PRICE = 50000
DEFAULT_INSURANCE_FACTOR = 3
DEFAULT_COUNT_CHECK_PRICE = 20

USER_PERMISSIONS = (
    'add_address',
    'change_address',
    'delete_address',
    'view_address',

    'add_bol',
    'change_bol',
    'delete_bol',
    'view_bol',

    'add_order',
    'change_address_order',
    'view_order',

    'view_orderitem',
    'change_color_orderitem',
    'change_size_orderitem',
    'change_note_orderitem',
)

DEFAULT_META = {
    'title': APP_TITLE,
    'description': APP_DESCRTIPTION,
    'image': DEFAULT_IMG
}

ERROR_CODES = {
    'OK': 200,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'METHOD_NOT_ALLOWED': 405,
    'INTERNAL_SERVER_ERROR': 500,
}

LOGGING = DEFAULT_LOGGING

SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL', '')

LOGGING['handlers']['slack_admins'] = {
    'level': 'ERROR',
    'filters': ['require_debug_false'],
    'class': 'utils.helpers.slack_logger.SlackExceptionHandler',
}

LOGGING['loggers']['django'] = {
    'handlers': ['console', 'slack_admins'],
    'level': 'INFO',
}
