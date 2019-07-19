from rest_framework.serializers import ModelSerializer, CharField, SerializerMethodField
from rest_framework.validators import UniqueValidator
from .models import Bag


class BagBaseSr(ModelSerializer):
    area_uid = SerializerMethodField()

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

    def get_area_uid(self, obj):
        if not obj.area:
            return ''
        return obj.area.uid


class BagListSr(BagBaseSr):
    class Meta(BagBaseSr.Meta):
        fields = ('created_at', 'id', 'uid', )
