# core/event_bus.py

from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

class EventBus:
    def __init__(self):
        self.listeners = defaultdict(list)
        self.logger = logging.getLogger(self.__class__.__name__)

    def subscribe(self, event_type: str, callback):
        """Подписывает обработчик на определенный тип события."""
        self.listeners[event_type].append(callback)
        self.logger.info(f"New subscription for event '{event_type}' by {callback.__name__}")

    def publish(self, event_type: str, *args, **kwargs):
        """Публикует событие, вызывая всех подписчиков."""
        self.logger.info(f"Publishing event '{event_type}' with args: {args}, kwargs: {kwargs}")
        if event_type in self.listeners:
            for callback in self.listeners[event_type]:
                try:
                    callback(*args, **kwargs)
                except Exception as e:
                    self.logger.error(f"Error executing callback for event '{event_type}': {e}", exc_info=True)

# Глобальный экземпляр, чтобы все модули использовали одну и ту же шину
event_bus = EventBus()
