from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Config


class ConfigBaseSerializer(ModelSerializer):

    class Meta:
        model = Config
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=Config.objects.all(),
            message="Duplicate config",
        )]
    )
