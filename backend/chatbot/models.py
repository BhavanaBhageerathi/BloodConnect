from django.db import models
from django.conf import settings


class ChatConversation(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_conversations",
        null=True,
        blank=True
    )

    title = models.CharField(
        max_length=255,
        default="BloodConnect AI Chat"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        if self.user:
            return f"{self.user} - {self.title}"

        return f"Anonymous - {self.title}"


class ChatMessage(models.Model):

    ROLE_CHOICES = [
        ("USER", "User"),
        ("ASSISTANT", "Assistant"),
    ]

    conversation = models.ForeignKey(
        ChatConversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"