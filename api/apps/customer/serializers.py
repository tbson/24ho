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
            'cust_care',
            'order_fee_factor',
            'delivery_fee_mass_unit_price',
            'delivery_fee_volume_unit_price',
            'deposit_factor',
            'complaint_days',
            'sale',
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

    def get_sale_name(self, obj):
        return StaffUtils.getName(obj.sale)

    def get_cust_care_name(self, obj):
        return StaffUtils.getName(obj.cust_care)


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
