# core/__init__.py

# Делаем event_bus доступным для импорта из пакета core
from .event_bus import event_bus, EventBus
from .plugin_base import BasePlugin
from .plugin_manager import PluginManager

# Это позволяет импортировать так: from core import event_bus
__all__ = [
    "event_bus",
    "EventBus",
    "BasePlugin",
    "PluginManager"
]
