from django.db import models
from .serializers import OrderItemBaseSr


class OrderItemUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True, **kwargs) -> models.QuerySet:
        from apps.order.utils import OrderUtils
        order = OrderUtils.seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'order': order.id,
                'title': "title{}".format(i),
                'url': "url{}".format(i),
                'quantity': i,
                'unit_price': 10.5 + i
            }

            _order = kwargs.get('order', None)
            if _order is not None:
                data['order'] = _order.pk

            if save is False:
                return data

            instance = OrderItemBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def partial_update(obj, key, value):
        data = {}
        data[key] = value
        serializer = OrderItemBaseSr(obj, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return serializer

    @staticmethod
    def validate_bulk_create(order_items, order_id):
        for item in order_items:
            item['order'] = order_id
            order_item_sr = OrderItemBaseSr(data=item)
            order_item_sr.is_valid(raise_exception=True)
            order_item_sr.save()

    @staticmethod
    def batch_update(order, ids, params):
        from apps.order.models import Order
        order_items = order.order_items.filter(pk__in=ids)
        order_items.update(**params)
        Order.objects.re_cal(order)
