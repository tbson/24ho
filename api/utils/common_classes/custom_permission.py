from rest_framework import permissions


class CustomPermissionExp(permissions.BasePermission):

    def has_permission(self, request, view):
        action = view.action
        action = action if action not in ['list', 'retrieve'] else 'view'
        action = action if action not in ['delete', 'delete_list'] else 'delete'

        permission = action + '_' + view.name

        isAllow = False
        print(permission)
        if request.user.user_permissions.filter(codename=permission).count():
            print('case 1')
            isAllow = True
        if request.user.groups.filter(permissions__codename=permission).count():
            print('case 2')
            isAllow = True
        return isAllow


class CustomPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user.user_permissions.filter(codename__in=view.permissions).count():
            return True
        if request.user.groups.filter(permissions__codename__in=view.permissions).count():
            return True
        return False

    # def has_object_permission(self, request, view, obj):
    #    return True
