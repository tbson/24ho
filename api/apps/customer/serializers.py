from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from .models import Customer
from apps.staff.utils import StaffUtils
from utils.serializers.user import UserRetrieveSr
from utils.helpers.tools import Tools


class CustomerBaseSr(ModelSerializer):

    class Meta:
        model = Customer
        fields = [
            'id',
            'avatar',
            'phone',
            'company',
            'sale',
            'cust_care',
            'customer_group',
            'order_fee_factor',
            'delivery_fee_mass_unit_price',
            'delivery_fee_volume_unit_price',
            'deposit_factor',
            'complaint_days',
            'is_lock',
            'shopping_cart',
            'user',
            'user_data'
        ]
        read_only_fields = ('id',)

    user_data = SerializerMethodField()

    def get_user_data(self, obj):
        return UserRetrieveSr(obj.user).data


class CustomerRetrieveSr(CustomerBaseSr):

    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()
    customer_group_name = SerializerMethodField()

    def get_sale_name(self, obj):
        return StaffUtils.getName(obj.sale)

    def get_cust_care_name(self, obj):
        return StaffUtils.getName(obj.cust_care)

    def get_customer_group_name(self, obj):
        if not obj.customer_group:
            return ''
        return obj.customer_group.uid


class CustomerSelectSr(CustomerBaseSr):

    value = SerializerMethodField()
    label = SerializerMethodField()

    class Meta(CustomerBaseSr.Meta):
        fields = [
            'value',
            'label'
        ]

    def get_value(self, obj):
        return obj.pk

    def get_label(self, obj):
        return "{} / {}".format(obj.pk, Tools.get_fullname(obj))
