from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Bag


class BagBaseSr(ModelSerializer):

    class Meta:
        model = Bag
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=Bag.objects.all(),
            message="Duplicate bill of landing code",
        )],
        required=False,
    )
