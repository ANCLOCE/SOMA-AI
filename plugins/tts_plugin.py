# plugins/tts_plugin.py

import logging
import time
from core import BasePlugin

class TTSPlugin(BasePlugin):
    def get_name(self) -> str:
        return "Text-to-Speech Plugin"

    def setup(self):
        """Подписывается на событие ответа от LLM."""
        self.event_bus.subscribe("LLM_RESPONSE", self.handle_llm_response)
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.info("TTSPlugin setup complete. Waiting for LLM response.")
        # Здесь будет инициализация модели Piper/Coqui
        # self.tts_model = ...

    def handle_llm_response(self, text: str):
        """
        Принимает текст и "синтезирует" речь.
        Пока что это заглушка.
        """
        self.logger.info(f"Received text to synthesize: '{text}'")

        # --- Placeholder for actual TTS logic ---
        # self.logger.info("Starting speech synthesis...")
        # start_time = time.time()
        # audio_data = self.tts_model.synthesize(text)
        # end_time = time.time()
        # self.logger.info(f"Speech synthesized in {end_time - start_time:.2f} seconds.")
        # fake_audio_data = b"dummy_audio_data"
        # -----------------------------------------

        self.logger.info("Simulating speech synthesis...")
        time.sleep(1) # Имитация задержки на генерацию
        fake_audio_data = f"audio_for_{text[:15].replace(' ', '_')}.wav".encode('utf-8')

        self.logger.info(f"Generated audio data: {fake_audio_data}")
        self.event_bus.publish("TTS_GENERATED", fake_audio_data)
