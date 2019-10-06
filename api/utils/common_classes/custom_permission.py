from rest_framework import permissions


class CustomPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        print('aaaaaaaaaaaaaaaaaa')
        if request.user.is_superuser is True:
            return True

        action = view.action
        name = view._name
        action = action if action not in ['list', 'retrieve', 'retrieve_uid'] else 'view'
        action = action if action not in ['delete', 'delete_list'] else 'delete'

        if name == 'role':
            name = 'group'

        permission = action + '_' + name.replace('_', '')

        is_allow = False
        if request.user.user_permissions.filter(codename=permission).count():
            is_allow = True
        if request.user.groups.filter(permissions__codename=permission).count():
            is_allow = True
        return is_allow
