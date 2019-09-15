from rest_framework.serializers import ModelSerializer
from .models import CustomerBank


class CustomerBankBaseSr(ModelSerializer):

    class Meta:
        model = CustomerBank
        exclude = ()
        read_only_fields = ('id',)
