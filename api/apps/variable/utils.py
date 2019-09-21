from django.db import models


class VariableUtils:
    default_company_info = {
        'info_ten_cty': 'SAMPLE',
        'info_dia_chi': 'SAMPLE',
        'info_email': 'SAMPLE',
        'info_phone': 'SAMPLE',
        'info_website': 'SAMPLE',
        'guide_transaction': 'https://google.com',
    }

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import VariableBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
                'value': "value{}".format(i)
            }
            if save is False:
                return data

            instance = VariableBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def variable_seeding():
        from .models import Variable

        for uid, value in VariableUtils.default_company_info.items():
            try:
                Variable.objects.get(uid=uid)
            except Variable.DoesNotExist:
                new_item = Variable(uid=uid, value=value)
                new_item.save()

    @staticmethod
    def get_company_info() -> dict:
        from .models import Variable

        result = {}
        for uid, value in VariableUtils.default_company_info.items():
            try:
                item = Variable.objects.get(uid=uid)
                result[uid] = item.value
            except Variable.DoesNotExist:
                result[uid] = value
        return result
