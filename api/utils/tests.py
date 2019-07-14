from django.test import TestCase
from django.utils import timezone
import utils.helpers.res_tools as ResTools
from utils.helpers.tools import Tools
# Create your tests here.


class ResToolsTestCase(TestCase):

    def test_get_token(self):
        input = {
            'HTTP_COOKIE': ' sessionid=3eilw4un5izyfat3rd6lf6tga28apy9q; Domain=None; Max-Age=None; Path=/',
            'PATH_INFO': '/api/v1/admin/profile/',
            'REMOTE_ADDR': '127.0.0.1',
            'REQUEST_METHOD': 'GET',
            'SCRIPT_NAME': '',
            'SERVER_NAME': 'testserver',
            'SERVER_PORT': '80',
            'SERVER_PROTOCOL': 'HTTP/1.1',
            'QUERY_STRING': '',
            'Authorization': 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyOCwidXNlcm5hbWUiOiJ0YnNvbiIsImV'
        }
        output = ResTools.get_token(input)
        eput = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyOCwidXNlcm5hbWUiOiJ0YnNvbiIsImV'
        self.assertEqual(output, eput)
        self.assertEqual(ResTools.get_token({}), '')


class ToolsTestCase(TestCase):
    def test_date_to_str(self):
        input = timezone.now()
        output = Tools.date_to_str(input).split('/')

        self.assertEqual(Tools.date_to_str(''), '')
        self.assertEqual(Tools.date_to_str(None), '')

        self.assertEqual(len(output[0]), 2)
        self.assertEqual(len(output[1]), 2)
        self.assertEqual(len(output[2]), 4)

    def test_get_str_day_month(self):
        date = timezone.datetime(2019, 9, 17)
        output = Tools.get_str_day_month(date)
        eput = '17I'
        self.assertEqual(output, eput)


class ToolsGetNextUidOrder(TestCase):
    def test_normal_case(self):
        uid = '1HN001A5'
        output = Tools.get_next_uid_index(uid)
        eput = 6
        self.assertEqual(output, eput)

    def test_missing_uid(self):
        uid = ''
        output = Tools.get_next_uid_index(uid)
        eput = 1
        self.assertEqual(output, eput)
