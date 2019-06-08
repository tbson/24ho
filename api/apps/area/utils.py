from django.db import models


class AreaUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .models import Area

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'uid': "UID{}".format(i),
                'title': "title{}".format(i),
                'unit_price': 1000 + i
            }
            if save is False:
                return data

            try:
                return Area.objects.get(uid=data['uid'])
            except Area.DoesNotExist:
                return Area.objects.create(**data)

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
