from django.db import models


class CategoryUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .models import Category
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
                'title': "title{}".format(i),
                'type': "article" if i % 2 == 1 else "banner",
                'single': i % 2 == 0,
            }
            if save is False:
                return data

            try:
                return Category.objects.get(uid=data['uid'])
            except Category.DoesNotExist:
                return Category.objects.create(**data)

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
