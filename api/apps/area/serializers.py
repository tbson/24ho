from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Area


class AreaBaseSr(ModelSerializer):

    class Meta:
        model = Area
        exclude = ()
        read_only_fields = ('id',)
