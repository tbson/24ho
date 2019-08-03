from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Receipt


class ReceiptBaseSr(ModelSerializer):

    class Meta:
        model = Receipt
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(required=False, validators=[
        UniqueValidator(
            queryset=Receipt.objects.all(),
            message="Duplicate receipt",
        )]
    )
