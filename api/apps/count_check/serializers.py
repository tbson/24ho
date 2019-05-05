from rest_framework.serializers import ModelSerializer, ValidationError
from .models import CountCheck


class CountCheckBaseSr(ModelSerializer):
    COMPARE_MESSAGE = {
        "from_items": "Must to larger than 0 and smaller than To Amount",
        "to_items": "Must to larger than 0 and larger than From Amount",
    }

    class Meta:
        model = CountCheck
        exclude = ()
        read_only_fields = ('id',)

    def create(self, validated_data):
        # 0 < from_items < to_items
        if not 0 <= validated_data['from_items'] < validated_data['to_items']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance = CountCheck.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        # 0 < from_items < to_items
        if not 0 <= validated_data['from_items'] < validated_data['to_items']:
            raise ValidationError(self.COMPARE_MESSAGE)
        instance.__dict__.update(validated_data)
        instance.save()
        return instance
