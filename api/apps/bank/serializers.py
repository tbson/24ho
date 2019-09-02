from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Bank


class BankBaseSr(ModelSerializer):

    class Meta:
        model = Bank
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=Bank.objects.all(),
            message="Duplicate bank",
        )]
    )
