from django.contrib.auth.models import Permission


class RoleUtils:

    @staticmethod
    def all_permissions() -> dict:
        result: list = []
        permissions = Permission.objects.all()
        for pem in permissions:
            result.append({
                "id": pem.pk,
                "title": pem.name,
                "type": pem.content_type.model
            })
        return RoleUtils.group_content_type(result)

    @staticmethod
    def group_content_type(permissions: list) -> dict:
        result: dict = {}
        for pem in permissions:
            short_pem = {
                "id": pem["id"],
                "title": pem["title"],
            }
            content_type = str(pem["type"])
            if content_type not in result:
                result[content_type] = [short_pem]
            else:
                result[content_type].append(short_pem)
        return result
