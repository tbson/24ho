from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Address, AddressService
from apps.area.models import Area


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
        validated_data['uid'] = Address.objects.generatetUid(customer.pk, area.pk)
        return Address.objects.create(**validated_data)

    def update(self, instance, validated_data):
        pass
