from rest_framework.serializers import ModelSerializer, CharField
from rest_framework.validators import UniqueValidator
from .models import Article


class ArticleBaseSr(ModelSerializer):

    class Meta:
        model = Article
        exclude = ()
        read_only_fields = ('id',)

    uid = CharField(validators=[
        UniqueValidator(
            queryset=Article.objects.all(),
            message="Duplicate uid",
        )]
    )

    title = CharField(validators=[
        UniqueValidator(
            queryset=Article.objects.all(),
            message="Duplicate title",
        )]
    )