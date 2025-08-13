# plugins/knowledge_plugin.py

import logging
import os
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings
from llama_cpp import Llama
from core import BasePlugin

# --- GGUF-based Embedding Function ---
# This custom class allows ChromaDB to use llama.cpp for generating embeddings.
# This avoids downloading heavy libraries like torch and sentence-transformers.

class GGUFEmbeddingFunction(EmbeddingFunction):
    def __init__(self, model_path: str, n_ctx=512, n_batch=512):
        # Check if the model file exists before proceeding
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Embedding model not found at: {model_path}. Please download it.")

        # Initialize the Llama model specifically for embeddings
        self.llama = Llama(
            model_path=model_path,
            embedding=True,  # Crucial: enables embedding mode
            n_ctx=n_ctx,
            n_batch=n_batch,
            verbose=False
        )
        self.model_path = model_path
        logging.info(f"Initialized GGUF embedding model from: {model_path}")

    def __call__(self, input: Documents) -> Embeddings:
        # The embed method returns a list of embeddings for the input documents
        embeddings = self.llama.embed(input)
        return embeddings

# --- Knowledge Plugin ---

DB_PATH = "db"
COLLECTION_NAME = "knowledge_base"
# Path to the GGUF model for embeddings.
# This path needs to be updated if the model is stored elsewhere.
# The user will need to download this model as per the ARCHITECTURE.md file.
EMBEDDING_MODEL_PATH = "models/bge-small-en-v1.5-q4_k_m.gguf"

class KnowledgePlugin(BasePlugin):
    def get_name(self) -> str:
        return "Knowledge Base Plugin (RAG)"

    def setup(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.info("Setting up KnowledgePlugin with GGUF embeddings...")

        # 1. Инициализация клиента ChromaDB
        if not os.path.exists(DB_PATH):
            os.makedirs(DB_PATH)
        self.db_client = chromadb.PersistentClient(path=DB_PATH)

        # 2. Инициализация модели для создания эмбеддингов
        # We will create the models directory if it doesn't exist, but the user
        # is responsible for placing the model file inside.
        if not os.path.exists("models"):
            os.makedirs("models")
            self.logger.warning("Created 'models' directory. Please download GGUF embedding model into it.")

        try:
            embedding_function = GGUFEmbeddingFunction(model_path=EMBEDDING_MODEL_PATH)
        except FileNotFoundError as e:
            self.logger.error(f"{e}. The KnowledgePlugin will be non-functional until the model is available.")
            # We can't proceed without the model, so we stop the setup for this plugin.
            return

        # 3. Получение или создание коллекции в ChromaDB
        self.collection = self.db_client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=embedding_function
        )
        self.logger.info(f"ChromaDB collection '{COLLECTION_NAME}' loaded/created. Items: {self.collection.count()}")

        # 4. Подписка на события
        self.event_bus.subscribe("FILE_UPLOADED", self.handle_file_upload)
        self.event_bus.subscribe("KNOWLEDGE_QUERY", self.handle_knowledge_query)

        self.logger.info("KnowledgePlugin setup complete.")

    def handle_file_upload(self, file_path: str):
        if not hasattr(self, 'collection'):
            self.logger.error("Cannot handle file upload: KnowledgePlugin setup failed (model not found).")
            return

        self.logger.info(f"Received file upload event for: {file_path}")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()

            chunks = [p.strip() for p in text.split('\n\n') if p.strip()]
            if not chunks:
                self.logger.warning(f"File {file_path} is empty or has no valid chunks.")
                return

            ids = [f"{os.path.basename(file_path)}_{i}" for i in range(len(chunks))]

            self.collection.add(documents=chunks, ids=ids, metadatas=[{"source": file_path} for _ in chunks])
            self.logger.info(f"Added {len(chunks)} chunks from {file_path} to the knowledge base. Total items: {self.collection.count()}")
            self.event_bus.publish("KNOWLEDGE_UPDATE_COMPLETE", file_path)

        except Exception as e:
            self.logger.error(f"Failed to process file {file_path}: {e}", exc_info=True)
            self.event_bus.publish("KNOWLEDGE_UPDATE_FAILED", file_path, str(e))

    def handle_knowledge_query(self, original_query: str):
        if not hasattr(self, 'collection'):
            self.logger.error("Cannot handle knowledge query: KnowledgePlugin setup failed (model not found).")
            self.event_bus.publish("KNOWLEDGE_RESULT", original_query, "")
            return

        self.logger.info(f"Received knowledge query: '{original_query}'")
        try:
            results = self.collection.query(query_texts=[original_query], n_results=2)
            context = "\n".join(results['documents'][0]) if results['documents'] else ""
            self.logger.info(f"Found context: \n---\n{context}\n---")
            self.event_bus.publish("KNOWLEDGE_RESULT", original_query, context)

        except Exception as e:
            self.logger.error(f"Failed to query knowledge base: {e}", exc_info=True)
            self.event_bus.publish("KNOWLEDGE_RESULT", original_query, "")
