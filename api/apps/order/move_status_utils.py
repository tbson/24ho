from django.db import models
from rest_framework.serializers import ValidationError
from .models import Status
from apps.transaction.utils import TransactionUtils


class MoveStatusUtils:

    @staticmethod
    def move(item: models.QuerySet, status: Status, **context) -> models.QuerySet:
        if abs(item.status - status) > 1:
            raise ValidationError("Đơn hàng chuyển trạng thái không hợp lệ.")

        if status == Status.NEW:
            return MoveStatusUtils.new(item, **context)
        if status == Status.APPROVED:
            return MoveStatusUtils.approved(item, **context)
        if status == Status.DEBT:
            return MoveStatusUtils.debt(item, **context)
        if status == Status.PAID:
            return MoveStatusUtils.paid(item, **context)
        if status == Status.DISPATCHED:
            return MoveStatusUtils.dispatched(item, **context)
        if status == Status.CN_STORE:
            return MoveStatusUtils.cn_store(item, **context)
        if status == Status.VN_STORE:
            return MoveStatusUtils.vn_store(item, **context)
        if status == Status.EXPORTED:
            return MoveStatusUtils.exported(item, **context)
        if status == Status.DONE:
            return MoveStatusUtils.done(item, **context)
        if status == Status.DISCARD:
            return MoveStatusUtils.discard(item, **context)

    @staticmethod
    def save(item: models.QuerySet, status: Status) -> models.QuerySet:
        item.status = status
        item.save()
        return item

    @staticmethod
    def new(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.NEW

        def prepare():
            TransactionUtils.deposit(item, context.get('approver', None))

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def approved(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.APPROVED

        def prepare():
            if item.status == Status.NEW:
                TransactionUtils.deposit(item, context.get('approver', None))

            if item.status == Status.DEBT:
                pass
                # TransactionUtils.undeposit(item)

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def debt(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.DEBT

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def paid(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.PAID

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def dispatched(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.DISPATCHED

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def cn_store(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.CN_STORE

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def vn_store(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.VN_STORE

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def exported(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.EXPORTED

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def done(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.DONE

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()

    @staticmethod
    def discard(item: models.QuerySet, **context) -> models.QuerySet:
        new_status = Status.DISCARD

        def prepare():
            pass

        def move():
            return MoveStatusUtils.save(item, new_status)

        prepare()
        return move()
