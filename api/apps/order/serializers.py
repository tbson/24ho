from rest_framework.serializers import ModelSerializer, CharField, SerializerMethodField, ValidationError
from rest_framework.validators import UniqueValidator
from .models import Order, STATUS_CHOICES
from utils.helpers.tools import Tools


class OrderBaseSr(ModelSerializer):
    vnd_total_discount = SerializerMethodField()
    vnd_total = SerializerMethodField()
    customer_name = SerializerMethodField()
    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()
    approver_name = SerializerMethodField()
    address_name = SerializerMethodField()
    status_name = SerializerMethodField()
    purchase_code = CharField(required=False, allow_blank=True, validators=[
        UniqueValidator(
            queryset=Order.objects.all(),
            message="Duplicate purchase code",
        )]
    )

    class Meta:
        model = Order
        exclude = ()
        read_only_fields = ('id', 'uid', )
        extra_kwargs = {
            'customer': {'required': False},
            'uid': {'required': False}
        }

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

    def get_status_name(self, obj):
        return dict(STATUS_CHOICES).get(obj.status, '')

    '''
    def update(self, instance, validated_data):
        from .models import Status
        from .utils import error_messages
        if not Tools.is_testing():
            if instance.pending:
                raise ValidationError(error_messages['ORDER_WAS_PENDING'])
            if instance.status >= Status.EXPORTED:
                raise ValidationError(error_messages['ORDER_WAS_EXPORTED'])

        [setattr(instance, key, value) for key, value in validated_data.items()]
        instance.save()
        return instance
    '''
