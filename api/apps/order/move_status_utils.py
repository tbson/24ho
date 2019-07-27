from django.db import models
from rest_framework.serializers import ValidationError
from .models import Status


class MoveStatusUtils:

    @staticmethod
    def move(item: models.QuerySet, status: Status) -> models.QuerySet:
        if abs(item.status - status) > 1:
            raise ValidationError("Đơn hàng chuyển trạng thái không hợp lệ.")

        if status == Status.NEW:
            return MoveStatusUtils.new(item)
        if status == Status.APPROVED:
            return MoveStatusUtils.approved(item)
        if status == Status.DEBT:
            return MoveStatusUtils.debt(item)
        if status == Status.PAID:
            return MoveStatusUtils.paid(item)
        if status == Status.DISPATCHED:
            return MoveStatusUtils.dispatched(item)
        if status == Status.CN_STORE:
            return MoveStatusUtils.cn_store(item)
        if status == Status.VN_STORE:
            return MoveStatusUtils.vn_store(item)
        if status == Status.EXPORTED:
            return MoveStatusUtils.exported(item)
        if status == Status.DONE:
            return MoveStatusUtils.done(item)
        if status == Status.DISCARD:
            return MoveStatusUtils.discard(item)

    @staticmethod
    def save(item: models.QuerySet, status: Status) -> models.QuerySet:
        item.status = status
        item.save()
        return item

    @staticmethod
    def new(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.NEW

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def approved(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.APPROVED

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def debt(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.DEBT

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def paid(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.PAID

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def dispatched(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.DISPATCHED

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def cn_store(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.CN_STORE

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def vn_store(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.VN_STORE

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def exported(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.EXPORTED

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def done(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.DONE

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()

    @staticmethod
    def discard(item: models.QuerySet) -> models.QuerySet:
        new_status = Status.DISCARD

        def cleanup():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        cleanup()
        return move()
