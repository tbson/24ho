import os
import sys
import uuid
import magic
import asyncio
from enum import Enum
from PIL import Image
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)


class OrderStatus(Enum):
    NEW = 1
    APPROVED = 2
    DEBT = 3
    PAID = 4
    DISPATCHED = 5
    CN_STORE = 6
    VN_STORE = 7
    EXPORTED = 8
    DONE = 9
    DISCARD = 10


class LandingStatus(Enum):
    NEW = 1
    CN = 2
    VN = 3
    EXPORTED = 4


class DeliveryFeeType(Enum):
    MAX = 1
    RANGE = 2
    MASS = 3
    VOLUME = 4


class Tools():

    def __init__(self):
        pass

    @staticmethod
    def returnException(e):
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fileName = exc_tb.tb_frame.f_code.co_filename
        result = str(e) + ' => ' + fileName + ':' + str(exc_tb.tb_lineno)
        return result

    @staticmethod
    def stringToBool(input):
        input = input.lower().strip()
        if input == '' or input == 'false':
            return False
        return True

    @staticmethod
    def getUuid():
        return uuid.uuid4()

    @staticmethod
    def getThumbnail(path):
        pathArr = path.split('.')
        pathArr.insert(-1, 'thumb')
        return '.'.join(pathArr)

    @staticmethod
    def scaleImage(ratio, path, scaleOnly=False):
        maxWidth = settings.IMAGE_MAX_WIDTH
        try:
            image = Image.open(path)
            (originalWidth, originalHeight) = image.size
            width = maxWidth
            if originalWidth < maxWidth:
                width = originalWidth
            if ratio > 0:
                height = int(width / ratio)
            else:
                height = originalHeight
            widthFactor = width / originalWidth
            heightFactor = height / originalHeight

            factor = widthFactor
            if heightFactor > widthFactor:
                factor = heightFactor

            size = (int(originalWidth * factor), int(originalHeight * factor))

            if originalWidth > maxWidth:
                # Resize to 1 sise fit, 1 side larger than golden rectangle
                image = image.resize(size, Image.ANTIALIAS)
                image.save(path, 'JPEG')
                (originalWidth, originalHeight) = image.size

            # Crop to golden ratio
            if not scaleOnly:
                image = image.crop((0, (originalHeight - height) / 2, width, height + (originalHeight - height) / 2))
                image.save(path, 'JPEG')
        except Exception:
            pass

    @staticmethod
    def createThumbnail(width, path):
        try:
            size = (width, width)
            image = Image.open(path)
            image.thumbnail(size, Image.ANTIALIAS)
            image.save(Tools.getThumbnail(path), 'JPEG')
        except Exception:
            pass

    @staticmethod
    def removeFile(path, removeThumbnail=False):
        if os.path.isfile(path):
            os.remove(path)
            if removeThumbnail is True:
                thumbnail = Tools.getThumbnail(path)
                if os.path.isfile(thumbnail):
                    os.remove(thumbnail)

    @staticmethod
    def checkMime(fileBuffer):
        mimeType = magic.from_buffer(fileBuffer.read(), mime=True)
        mimeSource = {
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
        for filetype, listMimeType in mimeSource.items():
            if mimeType in listMimeType:
                return filetype
        return ''

    @staticmethod
    def sendEmail(subject, body, to):
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
            Tools.returnException(e)

    @staticmethod
    def sendEmailAsync(*args):
        Tools.asyncExec(Tools.sendEmail, *args)

    @staticmethod
    def asyncExec(func, *args):
        loop.run_in_executor(None, func, *args)

    @staticmethod
    def userFromToken(token):
        try:
            token = {'token': token}
            data = VerifyJSONWebTokenSerializer().validate(token)
            return data['user']
        except Exception:
            return None

    @staticmethod
    def langFromContext(context):
        return context['request'].META.get('HTTP_LANG', None)

    @staticmethod
    def langFromRequest(request):
        return request.META.get('HTTP_LANG', None)

    @staticmethod
    def parseUserRelatedData(data):
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
