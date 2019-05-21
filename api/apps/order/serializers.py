from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Order


class OrderBaseSr(ModelSerializer):
    vnd_total = SerializerMethodField()

    class Meta:
        model = Order
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'address': {'required': True}
        }

    def get_vnd_total(self, obj):
        from .utils import OrderUtils
        return OrderUtils.get_vnd_Total(obj.__dict__)
