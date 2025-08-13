# ui.py

import flet as ft
import logging
from core import event_bus

class ChatUI:
    def __init__(self, page: ft.Page):
        self.page = page
        self.logger = logging.getLogger(self.__class__.__name__)

        # File picker for document uploads
        self.file_picker = ft.FilePicker(on_result=self.on_file_picker_result)
        self.page.overlay.append(self.file_picker)

        # Chat history view
        self.chat_history = ft.ListView(expand=True, spacing=10, auto_scroll=True)

        # New message input field
        self.new_message_field = ft.TextField(
            hint_text="Введите сообщение...",
            expand=True,
            border_color="outline",
            border_radius=10,
        )
        self.is_processing = False

    def build(self):
        """Возвращает корневой элемент управления для Flet."""
        return ft.Column(
            controls=[
                ft.Container(
                    content=self.chat_history,
                    border=ft.border.all(1, "outline"),
                    border_radius=5,
                    padding=10,
                    expand=True,
                ),
                ft.Row(
                    controls=[
                        self.new_message_field,
                        ft.IconButton(
                            icon=ft.icons.SEND,
                            tooltip="Отправить",
                            on_click=self.send_message_click,
                        ),
                        ft.IconButton(
                            icon=ft.icons.MIC,
                            tooltip="Голосовой ввод (не реализовано)",
                            on_click=self.voice_input_click,
                        ),
                        ft.IconButton(
                            icon=ft.icons.UPLOAD_FILE,
                            tooltip="Загрузить файл для обучения",
                            on_click=lambda _: self.file_picker.pick_files(
                                allow_multiple=False,
                                allowed_extensions=["txt", "pdf"]
                            ),
                        ),
                    ]
                ),
            ],
            expand=True,
        )

    def send_message_click(self, e):
        """Обработчик нажатия на кнопку "Отправить"."""
        message_text = self.new_message_field.value
        if message_text and not self.is_processing:
            self.is_processing = True
            self.add_message("Вы", message_text)
            self.new_message_field.value = ""

            self.logger.info(f"UI publishing TEXT_INPUT event: '{message_text}'")
            event_bus.publish("TEXT_INPUT", message_text)

            self.page.update()

    def voice_input_click(self, e):
        self.add_message("Система", "Голосовой ввод пока не реализован.")
        self.page.update()

    def on_file_picker_result(self, e: ft.FilePickerResultEvent):
        """Обработчик выбора файла для загрузки."""
        if e.files:
            picked_file = e.files[0]
            file_path = picked_file.path
            self.logger.info(f"UI publishing FILE_UPLOADED event for: {file_path}")
            self.add_message("Система", f"Загрузка файла: {picked_file.name}...")
            event_bus.publish("FILE_UPLOADED", file_path)
            self.page.update()
        else:
            self.add_message("Система", "Загрузка файла отменена.")
            self.page.update()

    def add_message(self, author: str, text: str, is_assistant=False):
        """Добавляет новое сообщение в историю чата."""
        self.chat_history.controls.append(
            ft.Row(
                controls=[
                    ft.CircleAvatar(content=ft.Text(author[0])),
                    ft.Column([
                        ft.Text(author, weight="bold"),
                        ft.Text(text, selectable=True)
                    ])
                ]
            )
        )
        if is_assistant:
            self.is_processing = False

# --- UI State and Event Handlers ---

def setup_ui_handlers(page: ft.Page, chat_ui_instance: ChatUI):
    """Настраивает обработчики событий от ядра к UI."""

    def handle_llm_response(text: str):
        page.run_thread_safe(lambda: chat_ui_instance.add_message("Ассистент", text, is_assistant=True) or page.update())

    def handle_knowledge_update(file_path: str):
        page.run_thread_safe(lambda: chat_ui_instance.add_message("Система", f"Файл '{os.path.basename(file_path)}' успешно обработан.") or page.update())

    def handle_knowledge_fail(file_path: str, error: str):
        page.run_thread_safe(lambda: chat_ui_instance.add_message("Система", f"Ошибка обработки файла '{os.path.basename(file_path)}': {error}") or page.update())

    event_bus.subscribe("LLM_RESPONSE", handle_llm_response)
    event_bus.subscribe("KNOWLEDGE_UPDATE_COMPLETE", handle_knowledge_update)
    event_bus.subscribe("KNOWLEDGE_UPDATE_FAILED", handle_knowledge_fail)
    logging.info("UI handlers set up.")

def main(page: ft.Page):
    """Главная функция Flet-приложения."""
    page.title = "Оффлайн ИИ-Ассистент"
    page.vertical_alignment = ft.MainAxisAlignment.CENTER
    page.padding = 20

    chat_ui = ChatUI(page)
    setup_ui_handlers(page, chat_ui)

    page.add(chat_ui.build())
    page.update()
