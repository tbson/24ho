from rest_framework.serializers import ModelSerializer, CharField, SerializerMethodField
from rest_framework.validators import UniqueValidator
from .models import Order
from utils.helpers.tools import Tools


class OrderBaseSr(ModelSerializer):
    vnd_total_discount = SerializerMethodField()
    vnd_total = SerializerMethodField()
    customer_name = SerializerMethodField()
    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()
    approver_name = SerializerMethodField()
    address_name = SerializerMethodField()

    class Meta:
        model = Order
        exclude = ()
        read_only_fields = ('id', 'uid', )
        extra_kwargs = {
            'customer': {'required': False},
            'uid': {'required': False}
        }

    purchase_code = CharField(required=False, validators=[
        UniqueValidator(
            queryset=Order.objects.all(),
            message="Duplicate purchase code",
        )]
    )

    def get_vnd_total_discount(self, obj):
        from .utils import OrderUtils
        return OrderUtils.get_vnd_total_discount(obj.__dict__)

    def get_vnd_total(self, obj):
        from .utils import OrderUtils
        return OrderUtils.get_vnd_total(obj.__dict__)

    def get_customer_name(self, obj):
        return Tools.get_fullname(obj.customer)

    def get_sale_name(self, obj):
        if not obj.sale:
            return ''
        return Tools.get_fullname(obj.sale)

    def get_cust_care_name(self, obj):
        if not obj.cust_care:
            return ''
        return Tools.get_fullname(obj.cust_care)

    def get_approver_name(self, obj):
        if not obj.approver:
            return ''
        return Tools.get_fullname(obj.approver)

    def get_address_name(self, obj):
        if not obj.address:
            return ''
        return "{} - {}".format(obj.address.uid, obj.address.title)
