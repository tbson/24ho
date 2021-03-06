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


class ToolsIsSemiContain(TestCase):
    def test_normal_case(self):
        parent = [1, 2, 3]
        child = [1, 6]
        output = Tools.is_semi_contain(parent, child)
        eput = True
        self.assertEqual(output, eput)

    def test_normal_case_but_child_larger_than_parent(self):
        parent = [1, 2, 3]
        child = [1, 6, 3, 5]
        output = Tools.is_semi_contain(parent, child)
        eput = True
        self.assertEqual(output, eput)

    def test_sub_set(self):
        parent = [1, 2, 3]
        child = [1, 3]
        output = Tools.is_semi_contain(parent, child)
        eput = False
        self.assertEqual(output, eput)

    def test_no_intersection(self):
        parent = [1, 2, 3]
        child = [4, 5]
        output = Tools.is_semi_contain(parent, child)
        eput = False
        self.assertEqual(output, eput)


class ToolsRemoveSpecialChars(TestCase):
    def test_normal_case(self):
        input = 'abc'
        output = Tools.remove_special_chars(input)
        eput = 'abc'
        self.assertEqual(output, eput)

    def test_special_case(self):
        input = ' abc* '
        output = Tools.remove_special_chars(input)
        eput = 'abc'
        self.assertEqual(output, eput)

    def test_special_case_upper(self):
        input = ' abc* '
        output = Tools.remove_special_chars(input, True)
        eput = 'ABC'
        self.assertEqual(output, eput)
