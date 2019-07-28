from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Transaction


class TransactionBaseSr(ModelSerializer):

    class Meta:
        model = Transaction
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(required=False, validators=[
        UniqueValidator(
            queryset=Transaction.objects.all(),
            message="Duplicate transaction",
        )]
    )
