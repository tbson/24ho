from django.utils import timezone
from django.db import models
from utils.helpers.tools import Tools
from apps.area.utils import AreaUtils
from apps.staff.utils import StaffUtils


class BagUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import BagBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        area = AreaUtils.seeding(1, True)
        staff = StaffUtils.seeding(1, True)

        def get_data(i: int) -> dict:

            data = {
                'area': area.pk,
                'staff': staff.pk,
            }
            if save is False:
                return data

            instance = BagBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_next_uid(area: models.QuerySet) -> str:
        date = timezone.now()
        last_uid = BagUtils.get_last_uid(date, area)
        date_part = Tools.get_str_day_month(date)
        index = Tools.get_next_uid_index(last_uid)
        return "{}{}{}".format(area.uid, date_part, index)

    @staticmethod
    def get_last_uid(date: timezone, area: models.QuerySet) -> str:
        from apps.bag.models import Bag
        year = date.year
        month = date.month
        day = date.day
        last_item = Bag.objects.filter(
            created_at__year=year,
            created_at__month=month,
            created_at__day=day,
            area=area
        ).order_by('-id').first()
        last_uid = last_item.uid if last_item is not None else ''
        return last_uid
