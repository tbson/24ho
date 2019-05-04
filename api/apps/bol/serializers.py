from rest_framework.serializers import ModelSerializer
from .models import Bol


class BolBaseSr(ModelSerializer):

    class Meta:
        model = Bol
        exclude = ()
        read_only_fields = ('id',)
