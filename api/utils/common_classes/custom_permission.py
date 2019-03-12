from rest_framework import permissions


class CustomPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        action = view.action
        action = action if action not in ['list', 'retrieve'] else 'view'
        action = action if action not in ['delete', 'delete_list'] else 'delete'

        permission = action + '_' + view._name

        isAllow = False
        if request.user.user_permissions.filter(codename=permission).count():
            isAllow = True
        if request.user.groups.filter(permissions__codename=permission).count():
            isAllow = True
        return isAllow
