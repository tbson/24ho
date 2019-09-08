
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from .models import Staff
from utils.serializers.user import UserRetrieveSr
from utils.serializers.group import GroupBaseSr
from utils.helpers.tools import Tools


class StaffBaseSr(ModelSerializer):

    class Meta:
        model = Staff
        fields = [
            'id',
            'is_cust_care',
            'is_sale',
            'is_lock',
            'user',
            'groups',
            'user_data'
        ]
        read_only_fields = ('id',)

    user_data = SerializerMethodField()
    groups = SerializerMethodField()

    def get_user_data(self, obj):
        return UserRetrieveSr(obj.user).data

    def get_groups(self, obj):
        groups = GroupBaseSr(obj.user.groups.all(), many=True).data
        return map(lambda group: group['id'], groups)


class StaffSelectSr(StaffBaseSr):

    value = SerializerMethodField()
    label = SerializerMethodField()

    class Meta(StaffBaseSr.Meta):
        fields = [
            'value',
            'label'
        ]

    def get_value(self, obj):
        return obj.pk

    def get_label(self, obj):
        return "{} / {}".format(obj.pk, Tools.get_fullname(obj))
