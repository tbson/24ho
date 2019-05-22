from django.db import models
from apps.area.models import Area
from apps.category.utils import CategoryUtils


class ArticleUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.article.serializers import ArticleBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        category = CategoryUtils.seeding(1, True)

        def get_data(i: int) -> dict:
            data = {
                'category': category.pk,
                'uid': "uid{}".format(i),
                'title': "title{}".format(i),
                'content': "content{}".format(i),
            }

            if save is False:
                return data

            instance = ArticleBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)