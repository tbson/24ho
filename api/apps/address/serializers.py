from rest_framework.serializers import ModelSerializer
from .models import Address
from .utils import AddressUtils


class AddressBaseSr(ModelSerializer):

    class Meta:
        model = Address
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'uid': {'required': False}
        }

    def create(self, validated_data):
        customer = validated_data['customer']
        area = validated_data['area']
        validated_data['uid'] = AddressUtils.generate_uid(customer.pk, area.pk)
        return Address.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.__dict__.update(validated_data)
        customer = validated_data['customer']
        area = validated_data['area']
        validated_data['uid'] = AddressUtils.generate_uid(customer.pk, area.pk)
        return instance
