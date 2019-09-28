from rest_framework.serializers import ModelSerializer, CharField, SerializerMethodField
from rest_framework.validators import UniqueValidator
from .models import CustomerGroup


class CustomerGroupBaseSr(ModelSerializer):

    class Meta:
        model = CustomerGroup
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=CustomerGroup.objects.all(),
            message="Duplicate customer_group",
        )]
    )


class CustomerGroupSelectSr(CustomerGroupBaseSr):

    value = SerializerMethodField()
    label = SerializerMethodField()

    class Meta(CustomerGroupBaseSr.Meta):
        fields = [
            'value',
            'label'
        ]

    def get_value(self, obj):
        return obj.pk

    def get_label(self, obj):
        return obj.uid
