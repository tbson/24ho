import os
import sys
import uuid
import magic
import asyncio
from PIL import Image
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)


class Tools:

    @staticmethod
    def return_exception(e):
        exc_type, exc_obj, exc_tb = sys.exc_info()
        file_name = exc_tb.tb_frame.f_code.co_filename
        result = str(e) + ' => ' + file_name + ':' + str(exc_tb.tb_lineno)
        return result

    @staticmethod
    def string_to_bool(input):
        input = input.lower().strip()
        if input == '' or input == 'false':
            return False
        return True

    @staticmethod
    def get_uuid():
        return uuid.uuid4()

    @staticmethod
    def get_thumbnail(path):
        path_arr = path.split('.')
        path_arr.insert(-1, 'thumb')
        return '.'.join(path_arr)

    @staticmethod
    def scale_image(ratio, path, scale_only=False):
        max_width = settings.IMAGE_MAX_WIDTH
        try:
            image = Image.open(path)
            (original_width, original_height) = image.size
            width = max_width
            if original_width < max_width:
                width = original_width
            if ratio > 0:
                height = int(width / ratio)
            else:
                height = original_height
            width_factor = width / original_width
            height_factor = height / original_height

            factor = width_factor
            if height_factor > width_factor:
                factor = height_factor

            size = (int(original_width * factor), int(original_height * factor))

            if original_width > max_width:
                # Resize to 1 sise fit, 1 side larger than golden rectangle
                image = image.resize(size, Image.ANTIALIAS)
                image.save(path, 'JPEG')
                (original_width, original_height) = image.size

            # Crop to golden ratio
            if not scale_only:
                image = image.crop((0, (original_height - height) / 2, width, height + (original_height - height) / 2))
                image.save(path, 'JPEG')
        except Exception:
            pass

    @staticmethod
    def create_thumbnail(width, path):
        try:
            size = (width, width)
            image = Image.open(path)
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(Tools.get_thumbnail(path), 'JPEG')
        except Exception:
            pass

    @staticmethod
    def remove_file(path, remove_thumbnail=False):
        if os.path.isfile(path):
            os.remove(path)
            if remove_thumbnail is True:
                thumbnail = Tools.get_thumbnail(path)
                if os.path.isfile(thumbnail):
                    os.remove(thumbnail)

    @staticmethod
    def check_mime(fileBuffer):
        mime_type = magic.from_buffer(fileBuffer.read(), mime=True)
        mime_source = {
            'image': [
                'image/gif',
                'image/jpeg',
                'image/png',
                'image/psd',
                'image/bmp',
                'image/tiff',
                'image/tiff',
                'image/jp2',
                'image/iff',
                'image/vnd.wap.wbmp',
                'image/xbm',
                'image/vnd.microsoft.icon',
            ],
            'pdf': [
                'application/pdf',
            ],
            'text': [
                'text/plain',
            ],
            'document': [
                'application/msword',
                'application/octet-stream',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-word.document.macroenabled.12',
            ],
            'spreadsheet': [
                'application/excel',
                'application/vnd.ms-excel',
                'application/x-excel',
                'application/x-msexcel',
                'application/vnd.ms-excel.sheet.binary.macroenabled.12',
                'application/vnd.ms-excel.sheet.macroenabled.12',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            'archive': [
                'application/x-rar-compressed',
                'application/x-rar',
                'application/zip',
                'application/x-tar',
                'application/x-7z-compressed',
                'application/gzip',
                'application/tar',
                'application/tar+gzip',
                'application/x-gzip',
            ]
        }
        for filetype, list_mime_type in mime_source.items():
            if mime_type in list_mime_type:
                return filetype
        return ''

    @staticmethod
    def send_email(subject, body, to):
        try:
            if settings.EMAIL_ENABLE is not True:
                return
            if type(to) is not list:
                to = [str(to)]
            email = EmailMultiAlternatives(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                to
            )
            email.content_subtype = "html"
            email.attach_alternative(body, "text/html")
            email.send()
        except Exception as e:
            print(e)
            Tools.return_exception(e)

    @staticmethod
    def send_email_async(*args):
        Tools.async_exec(Tools.send_email, *args)

    @staticmethod
    def async_exec(func, *args):
        loop.run_in_executor(None, func, *args)

    @staticmethod
    def user_from_token(token):
        try:
            token = {'token': token}
            data = VerifyJSONWebTokenSerializer().validate(token)
            return data['user']
        except Exception:
            return None

    @staticmethod
    def lang_from_fontext(context):
        return context['request'].META.get('HTTP_LANG', None)

    @staticmethod
    def lang_from_request(request):
        return request.META.get('HTTP_LANG', None)

    @staticmethod
    def parse_user_related_data(data):
        user = {
            'email': data.pop('email', None),
            'username': data.pop('username', None),
            'first_name': data.pop('first_name', None),
            'last_name': data.pop('last_name', None),
            'password': data.pop('password', None),
            'groups': data.pop('groups', '')
        }
        return {
            'user': user,
            'remain': data
        }
