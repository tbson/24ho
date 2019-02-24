import uuid
import os
from PIL import Image
# from django.db.models.signals import post_save
from django.conf import settings
from django.db import models
from utils.helpers.tools import Tools


def file_destination(instance, filename):
    ext = filename.split('.')[-1]
    if instance.filetype == 'image':
        ext = 'jpg'
    filename = "%s.%s" % (uuid.uuid4(), ext)
    return os.path.join('attach', filename)


class AttachManager(models.Manager):
    def removeByUUID(self, parent_uuid):
        listItem = self.filter(parent_uuid=parent_uuid)
        for item in listItem:
            item.delete()

# Create your models here.


class Attach(models.Model):
    parent_uuid = models.CharField(max_length=36)
    richtext_image = models.BooleanField(default=True)
    title = models.CharField(max_length=256)
    filetype = models.CharField(max_length=32, default='image')
    attachment = models.FileField(upload_to=file_destination)
    order = models.IntegerField(default=1)

    objects = AttachManager()

    def save(self, *args, **kwargs):

        if not self.title:
            self.title = self.attachment.path.split("/")[-1]

        if not self._state.adding and self.attachment:
            item = Attach.objects.get(pk=self.pk)
            if not self.richtext_image:
                self.richtext_image = item.richtext_image
            if item.attachment != self.attachment:
                # Update: remove exist attachment
                removeThumbnail = False
                if item.filetype == 'image':
                    removeThumbnail = True
                Tools.removeFile(item.attachment.path, removeThumbnail)
        if self.order == 0:
            if Attach.objects.count() > 0:
                self.order = Attach.objects.order_by('-order').first().order + 1
            else:
                self.order = 1
        super(Attach, self).save(*args, **kwargs)
        if self.filetype == 'image':
            imageRatio = settings.IMAGE_RATIO
            if self.richtext_image:
                imageRatio = 0
            Tools.scaleImage(settings.IMAGE_RATIO, self.attachment.path)
            Tools.createThumbnail(settings.IMAGE_THUMBNAIL_WIDTH, self.attachment.path)

    def delete(self, *args, **kwargs):
        removeThumbnail = False
        if self.filetype == 'image':
            removeThumbnail = True
        Tools.removeFile(self.attachment.path, removeThumbnail)
        super(Attach, self).delete(*args, **kwargs)

    class Meta:
        db_table = "attaches"
        ordering = ['-id']


'''
def after_save(sender, instance, **kwargs):
    instance.mime = Tools.getMime(instance.attachment.path).split('/')[0]
    instance.save()

post_save.connect(after_save, sender=Attach)
'''
