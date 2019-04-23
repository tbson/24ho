from rest_framework.serializers import ModelSerializer
from .models import Rate


class RateBaseSr(ModelSerializer):

    class Meta:
        model = Rate
        exclude = ()
        read_only_fields = ('id',)
