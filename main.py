# main.py

import flet as ft
import logging
import threading
from core import event_bus, PluginManager
from ui import main as ui_main # Импортируем главную функцию UI

# Настраиваем логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)

def start_backend():
    """
    Инициализирует и запускает все бэкенд-плагины в отдельном потоке.
    Это предотвращает блокировку UI во время загрузки моделей.
    """
    logging.info("--- Backend: Initializing plugins in a new thread... ---")
    plugin_manager = PluginManager(plugin_folder="plugins", event_bus=event_bus)
    plugin_manager.discover_and_load_plugins()
    plugin_manager.setup_all_plugins()
    logging.info("--- Backend: All plugins loaded and set up. ---")

def main():
    """
    Главная точка входа. Запускает бэкенд в отдельном потоке
    и запускает Flet UI.
    """
    # Запускаем инициализацию плагинов в фоновом потоке
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()

    # Запускаем Flet UI в основном потоке
    # Flet должен работать в основном потоке
    logging.info("--- Frontend: Starting Flet UI... ---")
    ft.app(target=ui_main)
    logging.info("--- Frontend: Flet UI closed. ---")

if __name__ == "__main__":
    main()
