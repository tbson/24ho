from rest_framework.serializers import ModelSerializer, ValidationError
from .models import DeliveryFee


class DeliveryFeeBaseSr(ModelSerializer):
    COMPARE_MESSAGE = {
        "start": "Must to larger than 0 and smaller than To mass",
        "stop": "Must to larger than 0 and larger than From mass",
    }

    class Meta:
        model = DeliveryFee
        exclude = ()
        read_only_fields = ('id',)

    def create(self, validated_data):
        # 0 < start < stop
        if not 0 <= validated_data['start'] < validated_data['stop']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance = DeliveryFee.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        # 0 < start < stop
        if not 0 <= validated_data['start'] < validated_data['stop']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance.__dict__.update(validated_data)
        instance.save()
        return instance
