from django.db import models
from django.db.models import Sum, F
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from apps.order_fee.models import OrderFee

class OrderService():
    @staticmethod
    def match_uid(last_order_uid: str) -> str:
        import re
        if last_order_uid:
            last_order = re.split('[A-L]', last_order_uid)[-1]
        return int(last_order)

class Status:
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


class OrderManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True, new_address: bool = True) -> models.QuerySet:
        from apps.address.models import Address
        from apps.order.serializers import OrderBaseSr

        if new_address is True:
            address = Address.objects.seeding(1, True)
        else:
            address = Address.objects.last()

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'address': address.id,
                'shop_link': "shop_link{}".format(i),
                'shop_nick': "shop_nick{}".format(i),
                'site': "site{}".format(i),
                'rate': 3400,
                'real_rate': 3300,
                'uid': Order.objects.generate_uid(address_id=address.id)
            }
            if save is False:
                return data

            instance = OrderBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    def sum_cny(self, order: dict) -> float:
        cny_amount = order.get('cny_amount', 0)

        cny_order_fee = order.get('cny_order_fee', 0)

        cny_inland_delivery_fee = order.get('cny_inland_delivery_fee', 0)

        cny_count_check_fee = order.get('cny_count_check_fee', 0)
        cny_shockproof_fee = order.get('cny_shockproof_fee', 0)
        cny_wooden_box_fee = order.get('cny_wooden_box_fee', 0)

        series = [
            cny_amount,
            cny_order_fee,
            cny_inland_delivery_fee,
            cny_count_check_fee,  # VND
            cny_shockproof_fee,  # CNY
            cny_wooden_box_fee,  # CNY
        ]

        return sum(series)

    def sum_vnd(self, order: dict) -> int:
        vnd_delivery_fee = order.get('vnd_delivery_fee', 0)
        vnd_sub_fee = order.get('vnd_sub_fee', 0)

        series = [
            vnd_delivery_fee,
            vnd_sub_fee
        ]

        return sum(series)

    def get_vnd_Total(self, order: dict) -> int:
        rate = order['rate']
        cny = self.sum_cny(order)
        vnd = self.sum_vnd(order)
        return int(rate * cny + vnd)

    def cal_amount(self, item: models.QuerySet) -> float:
        return item.order_items.aggregate(
            amount=Sum(
                F('quantity') * F('unit_price'),
                output_field=models.FloatField()
            )
        )['amount']

    def cal_order_fee(self, item: models.QuerySet) -> float:
        amount = item.cny_amount
        factor = OrderFee.objects.get_matched_factor(amount)
        if item.order_fee_factor_fixed:
            factor = item.order_fee_factor_fixed
        return factor * amount / 100

    def cal_delivery_fee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's delivery fee
        return sum([Bol.objects.cal_delivery_fee(bol) for bol in item.order_bols.all()])

    def cal_count_check_fee(self, item: models.QuerySet) -> float:
        from apps.count_check.models import CountCheck
        result = CountCheck.objects.get_matched_fee(item.order_items.count())
        if item.count_check_fee_input:
            result = item.count_check_fee_input
        return result

    def cal_shockproof_fee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's shockproof fee
        return sum([Bol.objects.cal_shockproof_fee(bol) for bol in item.order_bols.all()])

    def cal_wooden_box_fee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's wooden box fee
        return sum([Bol.objects.cal_wooden_box_fee(bol) for bol in item.order_bols.all()])

    def re_cal(self, item: models.QuerySet) -> models.QuerySet:
        '''
        Frezee after confirm
        '''
        item.cny_amount = self.cal_amount(item)
        item.cny_order_fee = self.cal_order_fee(item)
        # item.cny_inland_delivery_fee

        '''
        Frezee after export
        '''
        item.vnd_delivery_fee = self.cal_delivery_fee(item)
        item.cny_count_check_fee = self.cal_count_check_fee(item)
        item.cny_shockproof_fee = self.cal_shockproof_fee(item)
        item.cny_wooden_box_fee = self.cal_wooden_box_fee(item)
        # item.vnd_sub_fee

        item.save()
        return item

    def generate_uid(self,  address_id: int  ):
        from apps.address.models import Address
        from django.utils import timezone

        address = Address.objects.get(id=address_id)
        MONTH_LETTERS = {
            '01': 'A',
            '02': 'B',
            '03': 'C',
            '04': 'D',
            '05': 'E',
            '06': 'F',
            '07': 'G',
            '08': 'H',
            '09': 'I',
            '10': 'J',
            '11': 'K',
            '12': 'L'
        }

        address_uid = address.uid
        dd = timezone.now().strftime("%d")
        m = MONTH_LETTERS[timezone.now().strftime("%m")]
        orders = Order.objects.filter(address__pk=address.pk)
        if orders.count() > 0:
            order = OrderService.match_uid(last_order_uid=orders.first().uid) + 1
        else:
            order = 1
        order_uid = address_uid + dd + m + str(order)

        return order_uid

# Create your models here.

class Order(TimeStampedModel):

    STATUS_CHOICES = (
        (Status.NEW, 'Chờ duyệt'),
        (Status.APPROVED, 'Đã duyệt'),
        (Status.DEBT, 'Chờ thanh toán'),
        (Status.PAID, 'Đã thanh toán'),
        (Status.DISPATCHED, 'Đã phát hàng'),
        (Status.CN_STORE, 'Về kho TQ'),
        (Status.VN_STORE, 'Về kho VN'),
        (Status.EXPORTED, 'Đã xuất hàng'),
        (Status.DONE, 'Hoàn thành'),
        (Status.DISCARD, 'Huỷ'),
    )

    address = models.ForeignKey(Address, models.SET_NULL, related_name='order', null=True)

    thumbnail = models.CharField(max_length=500, blank=True)

    shop_link = models.CharField(max_length=250)
    shop_nick = models.CharField(max_length=250, blank=True)
    site = models.CharField(max_length=50)

    count_check = models.BooleanField(default=False)
    wooden_box = models.BooleanField(default=False)
    shockproof = models.BooleanField(default=False)

    count_check_fee_input = models.FloatField(default=0)

    cust_care = models.ForeignKey(Staff, models.SET_NULL, related_name='cust_care_orders', null=True)
    approver = models.ForeignKey(Staff, models.SET_NULL, related_name='approver_orders', null=True)
    approved_date = models.DateTimeField(null=True)

    rate = models.IntegerField()
    real_rate = models.IntegerField()

    cny_amount = models.FloatField(default=0)
    cny_order_fee = models.FloatField(default=0)
    cny_inland_delivery_fee = models.FloatField(default=0)
    cny_count_check_fee = models.FloatField(default=0)
    cny_shockproof_fee = models.FloatField(default=0)
    cny_wooden_box_fee = models.FloatField(default=0)

    vnd_delivery_fee = models.IntegerField(default=0)
    vnd_sub_fee = models.IntegerField(default=0)

    order_fee_factor = models.FloatField(default=0)
    order_fee_factor_fixed = models.FloatField(default=0)

    deposit_factor = models.FloatField(default=0)

    mass = models.FloatField(default=0)
    packages = models.IntegerField(default=0)
    number_of_bol = models.IntegerField(default=0)
    note = models.TextField(blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)

    uid = models.CharField(max_length=250, unique=True, blank=True)

    objects = OrderManager()

    def __str__(self):
        return self.address.title

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.uid = Order.objects.generate_uid(address_id=self.address.id)

        super(Order, self).save(*args, **kwargs)

    class Meta:
        db_table = "orders"
        ordering = ['-id']
