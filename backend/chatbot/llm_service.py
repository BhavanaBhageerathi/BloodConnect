from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import os

load_dotenv()


llm = ChatOpenAI(
    model="openai/gpt-oss-20b",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)


def generate_response(query, context, chat_history=None):

    if chat_history is None:
        chat_history = []

    history_text = ""

    for message in chat_history:

        history_text += f"{message['role']}: {message['content']}\n"

    prompt = f"""
You are BloodConnect AI Assistant.

You are an AI assistant for the BloodConnect Blood Donation Management System.

Your role is to answer questions related to:

- BloodConnect application features
- Blood donation
- Donor eligibility
- Blood donation procedures
- Blood donation aftercare
- Blood requests
- Blood banks
- General blood donation information

Use the conversation history to understand the context
of the user's current question.

Answer the user's question using the provided knowledge base context.

If the answer is not available in the provided context,
clearly inform the user that you do not have sufficient
information to answer the question.

Do not invent information.

Do not diagnose medical conditions or prescribe medication.

For medical concerns, advise the user to consult a
qualified healthcare professional or blood donation centre.

Conversation History:

{history_text}

Retrieved Knowledge Base Context:

{context}

Current User Question:

{query}

Answer:
"""

    response = llm.invoke(prompt)

    return response.content

if __name__ == "__main__":

    response = generate_response(
        query="What is BloodConnect?",
        context="BloodConnect is a blood donation management system.",
        chat_history=[]
    )

    print(response)