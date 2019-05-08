from django.db import models
from django.db.models import Sum, F
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from apps.order_fee.models import OrderFee


class OrderManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.address.models import Address
        from apps.order.serializers import OrderBaseSr

        address = Address.objects.seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'address': address.id,
                'shop_link': "shop_link{}".format(i),
                'shop_nick': "shop_nick{}".format(i),
                'site': "site{}".format(i),
                'rate': 3400,
                'real_rate': 3300
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

    def getCnyOrderFee(self, order):
        order_fee_factor_fixed = order.get('order_fee_factor_fixed', 0)
        factor = order.get('order_fee_factor', 0)
        if order_fee_factor_fixed:
            factor = order_fee_factor_fixed
        return factor * order.get('cny_amount', 0) / 100

    def sumCny(self, order: dict) -> float:
        cny_amount = order.get('cny_amount', 0)

        cny_order_fee = self.getCnyOrderFee(order)

        cny_inland_delivery_fee = order.get('cny_inland_delivery_fee', 0)

        cny_insurance_fee = order.get('cny_insurance_fee', 0)

        cny_count_check_fee = order.get('cny_count_check_fee', 0)
        cny_shockproof_fee = order.get('cny_shockproof_fee', 0)
        cny_wooden_box_fee = order.get('cny_wooden_box_fee', 0)

        cny_sub_fee = order.get('cny_sub_fee', 0)

        series = [
            cny_amount,
            cny_order_fee,
            cny_inland_delivery_fee,
            cny_insurance_fee,
            cny_count_check_fee,
            cny_shockproof_fee,
            cny_wooden_box_fee,
            cny_sub_fee,
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

    def calOrderFee(self, amount: float) -> float:
        return OrderFee.objects.getMatchedFactor(amount) * amount / 100

    def calDeliveryFee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's delivery fee
        return sum([Bol.objects.calDeliveryFee(bol) for bol in item.order_bols.all()])

    def calInsuranceFee(self, item: models.QuerySet) -> float:
        from apps.bol.models import Bol
        # sum of bols's insurance fee
        return sum([Bol.objects.calInsuranceFee(bol) for bol in item.order_bols.all()])

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

    def calSubFee(self, item: models.QuerySet) -> float:
        # sum of bols's sub fee
        return sum([bol.cny_sub_fee for bol in item.order_bols.all()])

    def reCal(self, item: models.QuerySet) -> models.QuerySet:
        # Frezee after confirm
        item.cny_amount = self.calAmount(item)
        item.cny_order_fee = self.calOrderFee(item.cny_amount)
        item.cny_insurance_fee = self.calInsuranceFee(item)

        # Frezee after export
        item.vnd_delivery_fee = self.calDeliveryFee(item)
        item.cny_count_check_fee = self.calCountCheckFee(item)
        item.cny_shockproof_fee = self.calShockproofFee(item)
        item.cny_wooden_box_fee = self.calWoodenBoxFee(item)

        item.save()
        return item

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
    cny_inland_delivery_fee = models.FloatField(default=0)
    cny_sub_fee = models.FloatField(default=0)
    cny_insurance_fee = models.FloatField(default=0)
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

    objects = OrderManager()

    def __str__(self):
        return self.address.title

    class Meta:
        db_table = "orders"
        ordering = ['-id']
