from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import OrderItem


class OrderItemBaseSr(ModelSerializer):
    price = SerializerMethodField()

    class Meta:
        model = OrderItem
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'order': {'required': True}
        }

    def get_price(self, obj):
        return obj.quantity * obj.unit_price
