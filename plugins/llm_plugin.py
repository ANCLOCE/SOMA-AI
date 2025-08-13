# plugins/llm_plugin.py

import logging
from core import BasePlugin

class LLMPlugin(BasePlugin):
    def get_name(self) -> str:
        return "Large Language Model Plugin"

    def setup(self):
        """
        Подписывается на события:
        1. Ввод текста от пользователя (`TEXT_INPUT`) -> для запуска RAG-цепочки.
        2. Результат из базы знаний (`KNOWLEDGE_RESULT`) -> для генерации финального ответа.
        """
        self.event_bus.subscribe("TEXT_INPUT", self.start_rag_chain)
        self.event_bus.subscribe("KNOWLEDGE_RESULT", self.generate_final_response)
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.info("LLMPlugin setup complete. Ready for RAG chain.")
        # Здесь будет инициализация модели llama.cpp
        # self.llm = Llama(...)

    def start_rag_chain(self, query: str):
        """
        Шаг 1: Получает запрос и инициирует поиск в базе знаний.
        """
        self.logger.info(f"RAG Chain Step 1: Received query '{query}'. Querying knowledge base.")
        self.event_bus.publish("KNOWLEDGE_QUERY", query)

    def generate_final_response(self, original_query: str, context: str):
        """
        Шаг 2: Получает оригинальный запрос и контекст из базы знаний,
        формирует промпт и генерирует финальный ответ.
        """
        self.logger.info("RAG Chain Step 2: Received knowledge result. Generating final response.")

        if context:
            prompt = f"""
Основываясь на следующем контексте, ответь на вопрос. Если в контексте нет ответа, скажи, что не знаешь.
Контекст:
---
{context}
---
Вопрос: {original_query}
Ответ:"""
            self.logger.info("Using context from knowledge base.")
        else:
            prompt = f"Вопрос: {original_query}\nОтвет:"
            self.logger.info("No context found. Answering directly.")

        self.logger.info(f"Final prompt:\n{prompt}")

        # --- Placeholder for actual LLM logic ---
        # response = self.llm.create_completion(prompt=prompt, max_tokens=150)
        # generated_text = response['choices'][0]['text']
        if "секретный код" in original_query and "Красный Гном" in context:
            generated_text = "Секретный код - 'Красный Гном'."
        else:
            generated_text = f"Это симуляция ответа LLM на вопрос: '{original_query}'"
        # -----------------------------------------

        self.logger.info(f"Generated LLM response: '{generated_text}'")
        self.event_bus.publish("LLM_RESPONSE", generated_text)
