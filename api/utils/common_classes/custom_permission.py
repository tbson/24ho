from rest_framework import permissions


class CustomPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        action = view.action
        action = action if action not in ['list', 'retrieve', 'retrieve_uid'] else 'view'
        action = action if action not in ['delete', 'delete_list'] else 'delete'

        permission = action + '_' + view._name.replace('_', '')

        is_allow = False
        if request.user.user_permissions.filter(codename=permission).count():
            is_allow = True
        if request.user.groups.filter(permissions__codename=permission).count():
            is_allow = True
        return is_allow
