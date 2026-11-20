import os

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from .document_service import load_documents, split_documents
from .llm_service import generate_response


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CHROMA_DB_DIR = os.path.join(BASE_DIR, "chroma_db")


def create_embeddings():

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings


def create_vector_store():

    documents = load_documents()

    chunks = split_documents(documents)

    embeddings = create_embeddings()

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR,
        collection_name="bloodconnect_knowledge"
    )

    print("Vector database created successfully!")

    return vector_store


def load_vector_store():

    embeddings = create_embeddings()

    vector_store = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embeddings,
        collection_name="bloodconnect_knowledge"
    )

    return vector_store


def search_knowledge_base(query):

    vector_store = load_vector_store()

    results = vector_store.similarity_search(
        query,
        k=3
    )

    return results


def get_context(results):

    context = ""

    for result in results:

        context += result.page_content + "\n\n"

    return context


def chat_with_bloodconnect(query, chat_history=None):

    if chat_history is None:
        chat_history = []

    results = search_knowledge_base(query)

    context = get_context(results)

    response = generate_response(
        query=query,
        context=context,
        chat_history=chat_history
    )

    return response



