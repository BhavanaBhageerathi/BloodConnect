import os

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, "knowledge_base")


def load_documents():
    documents = []

    for filename in os.listdir(KNOWLEDGE_BASE_DIR):
        file_path = os.path.join(KNOWLEDGE_BASE_DIR, filename)

        if filename.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())

        elif filename.endswith(".txt"):
            loader = TextLoader(file_path, encoding="utf-8")
            documents.extend(loader.load())

    print(f"Loaded {len(documents)} document pages/files")

    return documents


def split_documents(documents):

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = text_splitter.split_documents(documents)

    print(f"Created {len(chunks)} chunks")

    return chunks


if __name__ == "__main__":

    documents = load_documents()

    chunks = split_documents(documents)

    for chunk in chunks:

        print("\n--------------------")

        print(chunk.metadata)

        print(chunk.page_content)