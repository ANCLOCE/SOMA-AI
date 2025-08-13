# core/plugin_manager.py

import os
import importlib.util
import inspect
import logging
from .event_bus import EventBus
from .plugin_base import BasePlugin

class PluginManager:
    def __init__(self, plugin_folder: str, event_bus: EventBus):
        self.plugin_folder = plugin_folder
        self.event_bus = event_bus
        self.plugins = []
        self.logger = logging.getLogger(self.__class__.__name__)

    def discover_and_load_plugins(self):
        """
        Находит, загружает и инициализирует все плагины из указанной папки.
        """
        self.logger.info(f"Discovering plugins in '{self.plugin_folder}'...")
        if not os.path.exists(self.plugin_folder):
            self.logger.warning(f"Plugin folder '{self.plugin_folder}' not found. Creating it.")
            os.makedirs(self.plugin_folder)
            return

        for filename in os.listdir(self.plugin_folder):
            if filename.endswith(".py") and not filename.startswith("__"):
                module_name = filename[:-3]
                filepath = os.path.join(self.plugin_folder, filename)

                try:
                    spec = importlib.util.spec_from_file_location(f"plugins.{module_name}", filepath)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    for name, cls in inspect.getmembers(module, inspect.isclass):
                        if issubclass(cls, BasePlugin) and cls is not BasePlugin:
                            self.logger.info(f"Found plugin class: {cls.__name__}")
                            plugin_instance = cls(self.event_bus)
                            self.plugins.append(plugin_instance)
                            self.logger.info(f"Successfully loaded plugin: {plugin_instance.get_name()}")
                except Exception as e:
                    self.logger.error(f"Failed to load plugin from {filename}: {e}", exc_info=True)

    def setup_all_plugins(self):
        """
        Вызывает метод setup() для всех загруженных плагинов.
        """
        if not self.plugins:
            self.logger.warning("No plugins loaded to set up.")
            return

        self.logger.info("Setting up all loaded plugins...")
        for plugin in self.plugins:
            try:
                plugin.setup()
                self.logger.info(f"Successfully set up plugin: {plugin.get_name()}")
            except Exception as e:
                self.logger.error(f"Failed to set up plugin {plugin.get_name()}: {e}", exc_info=True)
        self.logger.info("All plugins set up.")
