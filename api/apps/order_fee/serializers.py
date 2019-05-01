from rest_framework.serializers import ModelSerializer, ValidationError
from .models import OrderFee


class OrderFeeBaseSr(ModelSerializer):
    COMPARE_MESSAGE = {
        "from_amount": "Must to larger than 0 and smaller than To Amount",
        "to_amount": "Must to larger than 0 and larger than From Amount",
    }

    class Meta:
        model = OrderFee
        exclude = ()
        read_only_fields = ('id',)

    def create(self, validated_data):
        # 0 < from_amount < to_amount
        if not 0 <= validated_data['from_amount'] < validated_data['to_amount']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance = OrderFee.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        # 0 < from_amount < to_amount
        if not 0 <= validated_data['from_amount'] < validated_data['to_amount']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance.__dict__.update(validated_data)
        instance.save()
        return instance
