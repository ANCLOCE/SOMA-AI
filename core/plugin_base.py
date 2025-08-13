# core/plugin_base.py

from abc import ABC, abstractmethod
from .event_bus import EventBus

class BasePlugin(ABC):
    """
    Абстрактный базовый класс для всех плагинов.
    Каждый плагин должен наследоваться от этого класса.
    """
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

    @abstractmethod
    def setup(self):
        """
        Метод для инициализации плагина.
        Здесь происходит подписка на события.
        """
        pass

    @abstractmethod
    def get_name(self) -> str:
        """
        Возвращает имя плагина.
        """
        pass
