from rest_framework.serializers import ModelSerializer
from .models import Address


class AddressBaseSr(ModelSerializer):

    class Meta:
        model = Address
        exclude = ()
        read_only_fields = ('id', 'uid', )
        extra_kwargs = {
            'uid': {'required': False}
        }
