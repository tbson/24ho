from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Rate


class RateBaseSr(ModelSerializer):

    sub_rate = SerializerMethodField()
    order_rate = SerializerMethodField()

    class Meta:
        model = Rate
        exclude = ()
        read_only_fields = ('id',)

    def get_sub_rate(self, obj):
        return obj.rate + obj.sub_delta

    def get_order_rate(self, obj):
        return obj.rate + obj.order_delta
