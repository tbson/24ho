from django.db import models


class CategoryUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.category.serializers import CategoryBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
                'title': "title{}".format(i),
                'type': "type{}".format(i),
                'single': i % 2 == 0,
            }
            if save is False:
                return data

            instance = CategoryBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)