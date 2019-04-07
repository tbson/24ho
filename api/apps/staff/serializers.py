
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from .models import Staff
from apps.group.serializers import GroupBaseSr
from utils.serializers.user import UserRetrieveSr


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


class StaffCompactSr(StaffBaseSr):

    class Meta(StaffBaseSr.Meta):
        fields = ('id', 'fullname')

    fullname = SerializerMethodField()

    def get_fullname(self, obj):
        return "{} {}".format(obj.user.last_name, obj.user.first_name)
