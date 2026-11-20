from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import ChatConversation, ChatMessage
from .serializers import (
    ChatConversationSerializer,
    ChatConversationDetailSerializer
)

from .rag_service import chat_with_bloodconnect


class ChatView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        user_message = request.data.get("message")
        conversation_id = request.data.get("conversation_id")

        if not user_message:
            return Response(
                {"error": "Message cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check whether the user is authenticated
        if request.user.is_authenticated:
            user = request.user
        else:
            user = None

        # Find existing conversation or create a new one
        if conversation_id:

            try:
                conversation = ChatConversation.objects.get(
                    id=conversation_id,
                    user=user
                )

            except ChatConversation.DoesNotExist:
                return Response(
                    {"error": "Conversation not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        else:

            conversation = ChatConversation.objects.create(
                user=user,
                title=user_message[:50]
            )

        # Save user message
        ChatMessage.objects.create(
            conversation=conversation,
            role="USER",
            content=user_message
        )

        # Retrieve previous conversation messages
        previous_messages = ChatMessage.objects.filter(
            conversation=conversation
        ).order_by("created_at")

        chat_history = []

        messages_list = list(previous_messages)

        # Exclude the current user message
        for message in messages_list[:-1]:

            chat_history.append({
                "role": message.role,
                "content": message.content
            })

        # Generate AI response using RAG
        ai_response = chat_with_bloodconnect(
            query=user_message,
            chat_history=chat_history
        )

        # Save AI response
        ChatMessage.objects.create(
            conversation=conversation,
            role="ASSISTANT",
            content=ai_response
        )

        # Update conversation timestamp
        conversation.save()

        return Response(
            {
                "conversation_id": conversation.id,
                "user_message": user_message,
                "ai_response": ai_response
            },
            status=status.HTTP_200_OK
        )


class ConversationListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        # Anonymous users don't have saved user-specific history
        if not request.user.is_authenticated:
            return Response([])

        conversations = ChatConversation.objects.filter(
            user=request.user
        ).order_by("-updated_at")

        serializer = ChatConversationSerializer(
            conversations,
            many=True
        )

        return Response(serializer.data)


class ConversationDetailView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, conversation_id):

        # Anonymous users cannot access conversation history
        if not request.user.is_authenticated:
            return Response(
                {"error": "Please log in to view conversation history"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:

            conversation = ChatConversation.objects.get(
                id=conversation_id,
                user=request.user
            )

        except ChatConversation.DoesNotExist:

            return Response(
                {"error": "Conversation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChatConversationDetailSerializer(conversation)

        return Response(serializer.data)