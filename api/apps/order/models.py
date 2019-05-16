from django.db import models
from django.db.models import Sum, F
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from apps.order_fee.models import OrderFee

class OrderService():
    @staticmethod
    def match_uid(last_order_uid: str) -> str:
        if last_order_uid:
            last_order = ''
            for index, value in enumerate(last_order_uid[::-1]):
                try:
                    int(value)
                    last_order = last_order + value
                except ValueError:
                    break
        return int(last_order[::-1])

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

        def getData(i: int) -> dict:
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

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def sumCny(self, order: dict) -> float:
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

    def sumVnd(self, order: dict) -> int:
        vnd_delivery_fee = order.get('vnd_delivery_fee', 0)
        vnd_sub_fee = order.get('vnd_sub_fee', 0)

        series = [
            vnd_delivery_fee,
            vnd_sub_fee
        ]

        return sum(series)

    def getVndTotal(self, order: dict) -> int:
        rate = order['rate']
        cny = self.sumCny(order)
        vnd = self.sumVnd(order)
        return int(rate * cny + vnd)

    def calAmount(self, item: models.QuerySet) -> float:
        return item.order_items.aggregate(
            amount=Sum(
                F('quantity') * F('unit_price'),
                output_field=models.FloatField()
            )
        )['amount']

    def calOrderFee(self, item: models.QuerySet) -> float:
        amount = item.cny_amount
        factor = OrderFee.objects.getMatchedFactor(amount)
        if item.order_fee_factor_fixed:
            factor = item.order_fee_factor_fixed
        return factor * amount / 100

    def calDeliveryFee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's delivery fee
        return sum([Bol.objects.calDeliveryFee(bol) for bol in item.order_bols.all()])

    def calCountCheckFee(self, item: models.QuerySet) -> float:
        from apps.count_check.models import CountCheck
        result = CountCheck.objects.getMatchedFee(item.order_items.count())
        if item.count_check_fee_input:
            result = item.count_check_fee_input
        return result

    def calShockproofFee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's shockproof fee
        return sum([Bol.objects.calShockproofFee(bol) for bol in item.order_bols.all()])

    def calWoodenBoxFee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's wooden box fee
        return sum([Bol.objects.calWoodenBoxFee(bol) for bol in item.order_bols.all()])

    def reCal(self, item: models.QuerySet) -> models.QuerySet:
        '''
        Frezee after confirm
        '''
        item.cny_amount = self.calAmount(item)
        item.cny_order_fee = self.calOrderFee(item)
        # item.cny_inland_delivery_fee

        '''
        Frezee after export
        '''
        item.vnd_delivery_fee = self.calDeliveryFee(item)
        item.cny_count_check_fee = self.calCountCheckFee(item)
        item.cny_shockproof_fee = self.calShockproofFee(item)
        item.cny_wooden_box_fee = self.calWoodenBoxFee(item)
        # item.vnd_sub_fee

        item.save()
        return item

    def generate_uid(self,  address_id: int  ):
        from apps.address.models import Address
        import datetime

        address = Address.objects.get(id=address_id)
        month_dict = {
            '01': 'a',
            '02': 'b',
            '03': 'c',
            '04': 'd',
            '05': 'e',
            '06': 'f',
            '07': 'g',
            '08': 'h',
            '09': 'i',
            '10': 'j',
            '11': 'k',
            '12': 'l'
        }

        address_uid = address.uid
        dd = datetime.datetime.now().strftime("%d")
        m = month_dict[datetime.datetime.now().strftime("%m")]
        orders = Order.objects.filter(address__title=address.title)
        if orders.count() > 0:
            order = OrderService.match_uid(last_order_uid=orders.first().uid) + 1
        else:
            order = 1
        order_uid = address_uid + dd + m + str(order)

        return order_uid

# Create your models here.

class Order(TimeStampedModel):
    STATUS_CHOICES = (
        (1, 'Chờ duyệt'),
        (2, 'Đã duyệt'),
        (3, 'Chờ thanh toán'),
        (4, 'Đã thanh toán'),
        (5, 'Đã phát hàng'),
        (6, 'Về kho TQ'),
        (7, 'Về kho VN'),
        (8, 'Đã xuất hàng'),
        (9, 'Hoàn thành'),
        (10, 'Huỷ'),
    )

    address = models.ForeignKey(Address, models.SET_NULL, related_name='order', null=True)

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
