from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import AreaCode


class AreaCodeBaseSr(ModelSerializer):

    class Meta:
        model = AreaCode
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=AreaCode.objects.all(),
            message="Duplicate area code",
        )]
    )
