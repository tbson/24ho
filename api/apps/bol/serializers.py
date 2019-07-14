from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Bol, BolDate, Bag


class BolBaseSr(ModelSerializer):

    class Meta:
        model = Bol
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=Bol.objects.all(),
            message="Duplicate bill of landing code",
        )]
    )


class BolDateSr(ModelSerializer):

    class Meta:
        model = BolDate
        exclude = ()
        read_only_fields = ('id',)


class BagBaseSr(ModelSerializer):

    class Meta:
        model = Bag
        exclude = ()
        read_only_fields = ('id',)
