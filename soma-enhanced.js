// S.O.M.A. - Smart Omnipresent Mobile Assistant (Enhanced Version)
class SOMA {
    constructor() {
        this.isListening = false;
        this.currentLanguage = 'ru';
        this.currentMode = 'voice';
        this.activeModules = new Set(['cognitive_intelligence', 'multilingual', 'self_learning']);
        this.aiAgents = [];
        this.chatHistory = [];
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        
        // Многоязычные команды и ответы
        this.languageData = {
            ru: {
                wakeWord: 'сома',
                commands: {
                    createContent: ['создай контент', 'создать контент', 'напиши текст'],
                    createAI: ['создай ai', 'создай искусственный интеллект', 'создать помощника'],
                    smartHome: ['умный дом', 'дом', 'освещение', 'климат'],
                    dataAnalysis: ['анализ данных', 'анализ', 'статистика'],
                    calendar: ['календарь', 'расписание', 'встречи'],
                    settings: ['настройки', 'конфигурация', 'параметры'],
                    switchLanguage: {
                        en: ['переключи на английский', 'английский', 'english'],
                        it: ['переключи на итальянский', 'итальянский', 'italiano'],
                        az: ['переключи на азербайджанский', 'азербайджанский', 'azərbaycan']
                    }
                },
                responses: {
                    listening: 'Слушаю...',
                    error: 'Ошибка распознавания речи. Попробуйте еще раз.',
                    wakeResponse: 'Да, я вас слушаю!',
                    languageChanged: 'Переключил на {language}.',
                    contentCreation: 'Открываю интерфейс создания контента. Что вы хотите создать?',
                    aiCreation: 'Открываю интерфейс создания AI.',
                    smartHome: 'Подключаюсь к умному дому. Доступные устройства: освещение, климат-контроль, безопасность.',
                    dataAnalysis: 'Запускаю анализ данных. Пожалуйста, укажите источник данных для анализа.',
                    calendar: 'Открываю календарь. У вас есть встречи на сегодня в 14:00 и 16:30.',
                    settings: 'Открываю настройки. Здесь вы можете настроить модули, языки и интерфейс.',
                    greetings: [
                        'Привет! Как я могу помочь?',
                        'Здравствуйте! Готов к работе.',
                        'Приветствую! Чем займемся сегодня?'
                    ],
                    questions: [
                        'Отличный вопрос! Давайте разберем это подробнее.',
                        'Интересно! Позвольте мне проанализировать.',
                        'Хороший вопрос. У меня есть несколько идей.'
                    ],
                    tasks: [
                        'Понял задачу. Начинаю выполнение.',
                        'Отлично! Я займусь этим прямо сейчас.',
                        'Задача принята. Обрабатываю...'
                    ]
                }
            },
            en: {
                wakeWord: 'soma',
                commands: {
                    createContent: ['create content', 'write content', 'generate text'],
                    createAI: ['create ai', 'create artificial intelligence', 'create assistant'],
                    smartHome: ['smart home', 'home', 'lighting', 'climate'],
                    dataAnalysis: ['analyze data', 'data analysis', 'statistics'],
                    calendar: ['calendar', 'schedule', 'meetings'],
                    settings: ['settings', 'configuration', 'parameters'],
                    switchLanguage: {
                        ru: ['switch to russian', 'russian', 'русский'],
                        it: ['switch to italian', 'italian', 'italiano'],
                        az: ['switch to azerbaijani', 'azerbaijani', 'azərbaycan']
                    }
                },
                responses: {
                    listening: 'Listening...',
                    error: 'Speech recognition error. Please try again.',
                    wakeResponse: 'Yes, I\'m listening!',
                    languageChanged: 'Switched to {language}.',
                    contentCreation: 'Opening content creation interface. What would you like to create?',
                    aiCreation: 'Opening AI creation interface.',
                    smartHome: 'Connecting to smart home. Available devices: lighting, climate control, security.',
                    dataAnalysis: 'Starting data analysis. Please specify the data source for analysis.',
                    calendar: 'Opening calendar. You have meetings today at 2:00 PM and 4:30 PM.',
                    settings: 'Opening settings. Here you can configure modules, languages and interface.',
                    greetings: [
                        'Hello! How can I help you?',
                        'Hi! Ready to work.',
                        'Greetings! What shall we do today?'
                    ],
                    questions: [
                        'Great question! Let\'s explore this in detail.',
                        'Interesting! Let me analyze this.',
                        'Good question. I have several ideas.'
                    ],
                    tasks: [
                        'Understood the task. Starting execution.',
                        'Great! I\'ll handle this right now.',
                        'Task accepted. Processing...'
                    ]
                }
            },
            it: {
                wakeWord: 'soma',
                commands: {
                    createContent: ['crea contenuto', 'scrivi contenuto', 'genera testo'],
                    createAI: ['crea ai', 'crea intelligenza artificiale', 'crea assistente'],
                    smartHome: ['casa intelligente', 'casa', 'illuminazione', 'clima'],
                    dataAnalysis: ['analizza dati', 'analisi dati', 'statistiche'],
                    calendar: ['calendario', 'programma', 'riunioni'],
                    settings: ['impostazioni', 'configurazione', 'parametri'],
                    switchLanguage: {
                        ru: ['passa al russo', 'russo', 'русский'],
                        en: ['passa all\'inglese', 'inglese', 'english'],
                        az: ['passa all\'azero', 'azero', 'azərbaycan']
                    }
                },
                responses: {
                    listening: 'Ascoltando...',
                    error: 'Errore di riconoscimento vocale. Riprova.',
                    wakeResponse: 'Sì, ti sto ascoltando!',
                    languageChanged: 'Passato a {language}.',
                    contentCreation: 'Apertura dell\'interfaccia di creazione contenuti. Cosa vuoi creare?',
                    aiCreation: 'Apertura dell\'interfaccia di creazione AI.',
                    smartHome: 'Connessione alla casa intelligente. Dispositivi disponibili: illuminazione, controllo climatico, sicurezza.',
                    dataAnalysis: 'Avvio dell\'analisi dei dati. Specificare la fonte dati per l\'analisi.',
                    calendar: 'Apertura del calendario. Hai riunioni oggi alle 14:00 e 16:30.',
                    settings: 'Apertura delle impostazioni. Qui puoi configurare moduli, lingue e interfaccia.',
                    greetings: [
                        'Ciao! Come posso aiutarti?',
                        'Salve! Pronto a lavorare.',
                        'Saluti! Cosa facciamo oggi?'
                    ],
                    questions: [
                        'Ottima domanda! Esploriamo questo in dettaglio.',
                        'Interessante! Lasciami analizzare.',
                        'Buona domanda. Ho diverse idee.'
                    ],
                    tasks: [
                        'Compreso il compito. Avvio esecuzione.',
                        'Perfetto! Me ne occupo subito.',
                        'Compito accettato. Elaborazione...'
                    ]
                }
            },
            az: {
                wakeWord: 'soma',
                commands: {
                    createContent: ['məzmun yarat', 'mətn yaz', 'mətn yarat'],
                    createAI: ['ai yarat', 'süni intellekt yarat', 'köməkçi yarat'],
                    smartHome: ['ağıllı ev', 'ev', 'işıqlandırma', 'klima'],
                    dataAnalysis: ['məlumatları analiz et', 'məlumat analizi', 'statistika'],
                    calendar: ['təqvim', 'cədvəl', 'görüşlər'],
                    settings: ['parametrlər', 'konfiqurasiya', 'tənzimləmələr'],
                    switchLanguage: {
                        ru: ['rus dilinə keç', 'rus dili', 'русский'],
                        en: ['ingilis dilinə keç', 'ingilis dili', 'english'],
                        it: ['italyan dilinə keç', 'italyan dili', 'italiano']
                    }
                },
                responses: {
                    listening: 'Dinləyirəm...',
                    error: 'Nitq tanıma xətası. Yenidən cəhd edin.',
                    wakeResponse: 'Bəli, sizi dinləyirəm!',
                    languageChanged: '{language} dilinə keçdim.',
                    contentCreation: 'Məzmun yaratma interfeysini açıram. Nə yaratmaq istəyirsiniz?',
                    aiCreation: 'AI yaratma interfeysini açıram.',
                    smartHome: 'Ağıllı evə qoşulur. Mövcud cihazlar: işıqlandırma, iqlim idarəetməsi, təhlükəsizlik.',
                    dataAnalysis: 'Məlumat analizini başladıram. Analiz üçün məlumat mənbəyini göstərin.',
                    calendar: 'Təqvim açıram. Bu gün 14:00 və 16:30-da görüşləriniz var.',
                    settings: 'Parametrləri açıram. Burada modulları, dilləri və interfeysi konfiqurasiya edə bilərsiniz.',
                    greetings: [
                        'Salam! Sizə necə kömək edə bilərəm?',
                        'Xeyr! İşə hazıram.',
                        'Təbrik! Bu gün nə edək?'
                    ],
                    questions: [
                        'Əla sual! Bunu ətraflı araşdıraq.',
                        'Maraqlı! Analiz etməyə icazə verin.',
                        'Yaxşı sual. Bir neçə fikrim var.'
                    ],
                    tasks: [
                        'Tapşırığı başa düşdüm. İcra etməyə başlayıram.',
                        'Əla! Bunu indi həll edirəm.',
                        'Tapşırıq qəbul edildi. Emal edilir...'
                    ]
                }
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.setupSpeechSynthesis();
        this.loadUserPreferences();
        this.initializeModules();
    }

    setupEventListeners() {
        // Voice button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        }

        // Send message
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Language selector
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.changeLanguage(lang);
            });
        });

        // Interface modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.changeInterfaceMode(mode);
            });
        });

        // AI Creation modal
        const aiCreationBtn = document.querySelector('[data-action="ai-creation"]');
        const closeAiModal = document.getElementById('closeAiModal');
        const createAiBtn = document.getElementById('createAiBtn');

        if (aiCreationBtn) {
            aiCreationBtn.addEventListener('click', () => this.showAiCreationModal());
        }
        if (closeAiModal) {
            closeAiModal.addEventListener('click', () => this.hideAiCreationModal());
        }
        if (createAiBtn) {
            createAiBtn.addEventListener('click', () => this.createNewAI());
        }

        // Close modal on outside click
        const aiCreationModal = document.getElementById('aiCreationModal');
        if (aiCreationModal) {
            aiCreationModal.addEventListener('click', (e) => {
                if (e.target.id === 'aiCreationModal') {
                    this.hideAiCreationModal();
                }
            });
        }
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.updateRecognitionLanguage();

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
                this.showMessage(this.getResponse('listening'), 'soma');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showMessage(this.getResponse('error'), 'soma');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
        } else {
            console.warn('Speech recognition not supported');
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.style.display = 'none';
            }
        }
    }

    setupSpeechSynthesis() {
        if (this.speechSynthesis) {
            // Ждем загрузки голосов
            this.speechSynthesis.onvoiceschanged = () => {
                this.voices = this.speechSynthesis.getVoices();
                console.log('Available voices:', this.voices.length);
            };
        }
    }

    updateRecognitionLanguage() {
        if (this.recognition) {
            const langMap = {
                'ru': 'ru-RU',
                'en': 'en-US',
                'it': 'it-IT',
                'az': 'az-AZ'
            };
            this.recognition.lang = langMap[this.currentLanguage] || 'ru-RU';
        }
    }

    getVoiceForLanguage(lang) {
        const langMap = {
            'ru': 'ru-RU',
            'en': 'en-US',
            'it': 'it-IT',
            'az': 'az-AZ'
        };
        
        const targetLang = langMap[lang];
        return this.voices.find(voice => voice.lang.startsWith(targetLang)) || 
               this.voices.find(voice => voice.lang.startsWith('en')) || 
               this.voices[0];
    }

    speakText(text, lang = null) {
        if (!this.speechSynthesis) return;
        
        const targetLang = lang || this.currentLanguage;
        const voice = this.getVoiceForLanguage(targetLang);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = 0.9; // Немного медленнее для естественности
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        this.speechSynthesis.speak(utterance);
    }

    toggleVoiceRecognition() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn) return;
        
        const icon = voiceBtn.querySelector('i');
        
        if (this.isListening) {
            voiceBtn.classList.add('recording');
            icon.className = 'fas fa-stop';
        } else {
            voiceBtn.classList.remove('recording');
            icon.className = 'fas fa-microphone';
        }
    }

    processVoiceCommand(transcript) {
        this.showMessage(transcript, 'user');
        
        const currentLangData = this.languageData[this.currentLanguage];
        const wakeWord = currentLangData.wakeWord;
        
        // Process wake word
        if (transcript.toLowerCase().includes(wakeWord)) {
            const response = this.getResponse('wakeResponse');
            this.showMessage(response, 'soma');
            this.speakText(response);
            return;
        }

        // Process commands
        const response = this.analyzeCommand(transcript);
        this.showMessage(response, 'soma');
        this.speakText(response);
    }

    analyzeCommand(command) {
        const lowerCommand = command.toLowerCase();
        const currentLangData = this.languageData[this.currentLanguage];
        
        // Language switching
        for (const [lang, commands] of Object.entries(currentLangData.commands.switchLanguage)) {
            if (commands.some(cmd => lowerCommand.includes(cmd))) {
                this.changeLanguage(lang);
                return this.getResponse('languageChanged').replace('{language}', this.getLanguageName(lang));
            }
        }

        // Content creation
        if (currentLangData.commands.createContent.some(cmd => lowerCommand.includes(cmd))) {
            return this.handleContentCreation();
        }

        // AI creation
        if (currentLangData.commands.createAI.some(cmd => lowerCommand.includes(cmd))) {
            this.showAiCreationModal();
            return this.getResponse('aiCreation');
        }

        // Smart home
        if (currentLangData.commands.smartHome.some(cmd => lowerCommand.includes(cmd))) {
            return this.handleSmartHome();
        }

        // Data analysis
        if (currentLangData.commands.dataAnalysis.some(cmd => lowerCommand.includes(cmd))) {
            return this.handleDataAnalysis();
        }

        // Calendar
        if (currentLangData.commands.calendar.some(cmd => lowerCommand.includes(cmd))) {
            return this.handleCalendar();
        }

        // Settings
        if (currentLangData.commands.settings.some(cmd => lowerCommand.includes(cmd))) {
            return this.handleSettings();
        }

        // Default response with semantic understanding
        return this.generateContextualResponse(command);
    }

    generateContextualResponse(command) {
        const currentLangData = this.languageData[this.currentLanguage];
        
        // Simple semantic analysis
        if (command.includes('привет') || command.includes('hello') || command.includes('ciao') || command.includes('salam')) {
            return this.getRandomResponse(currentLangData.responses.greetings);
        } else if (command.includes('?') || command.includes('что') || command.includes('what') || command.includes('cosa') || command.includes('nə')) {
            return this.getRandomResponse(currentLangData.responses.questions);
        } else {
            return this.getRandomResponse(currentLangData.responses.tasks);
        }
    }

    getResponse(key) {
        const currentLangData = this.languageData[this.currentLanguage];
        return currentLangData.responses[key] || key;
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (message) {
            this.showMessage(message, 'user');
            input.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                const response = this.analyzeCommand(message);
                this.showMessage(response, 'soma');
                this.speakText(response);
            }, 1000);
        }
    }

    showMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'soma' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in history
        this.chatHistory.push({ text, sender, timestamp: new Date() });
    }

    handleQuickAction(action) {
        let response = '';
        
        switch (action) {
            case 'create-content':
                response = this.handleContentCreation();
                break;
            case 'smart-home':
                response = this.handleSmartHome();
                break;
            case 'ai-creation':
                this.showAiCreationModal();
                response = this.getResponse('aiCreation');
                break;
            case 'analysis':
                response = this.handleDataAnalysis();
                break;
            case 'calendar':
                response = this.handleCalendar();
                break;
            case 'settings':
                response = this.handleSettings();
                break;
        }
        
        if (response) {
            this.showMessage(response, 'soma');
            this.speakText(response);
        }
    }

    handleContentCreation() {
        return this.getResponse('contentCreation');
    }

    handleSmartHome() {
        return this.getResponse('smartHome');
    }

    handleDataAnalysis() {
        return this.getResponse('dataAnalysis');
    }

    handleCalendar() {
        return this.getResponse('calendar');
    }

    handleSettings() {
        return this.getResponse('settings');
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const langBtn = document.querySelector(`[data-lang="${lang}"]`);
        if (langBtn) {
            langBtn.classList.add('active');
        }
        
        // Update speech recognition language
        this.updateRecognitionLanguage();
        
        // Update wake word display
        const wakeWordElement = document.querySelector('.wake-word');
        if (wakeWordElement) {
            const currentLangData = this.languageData[lang];
            wakeWordElement.textContent = `Скажите "${currentLangData.wakeWord.toUpperCase()}" для активации`;
        }
        
        this.saveUserPreferences();
    }

    getLanguageName(lang) {
        const names = {
            'ru': 'русский',
            'en': 'английский',
            'it': 'итальянский',
            'az': 'азербайджанский'
        };
        return names[lang] || lang;
    }

    changeInterfaceMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (modeBtn) {
            modeBtn.classList.add('active');
        }
        
        this.saveUserPreferences();
    }

    getModeName(mode) {
        const names = {
            'voice': 'голосовой',
            'graphical': 'графический',
            'ar': 'дополненная реальность'
        };
        return names[mode] || mode;
    }

    showAiCreationModal() {
        const modal = document.getElementById('aiCreationModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideAiCreationModal() {
        const modal = document.getElementById('aiCreationModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    createNewAI() {
        const nameInput = document.getElementById('aiName');
        const specializationInput = document.getElementById('aiSpecialization');
        const descriptionInput = document.getElementById('aiDescription');
        
        if (!nameInput || !specializationInput) {
            this.showMessage('Пожалуйста, заполните все обязательные поля.', 'soma');
            return;
        }
        
        const name = nameInput.value;
        const specialization = specializationInput.value;
        const description = descriptionInput ? descriptionInput.value : '';
        
        if (!name || !specialization) {
            this.showMessage('Пожалуйста, заполните все обязательные поля.', 'soma');
            return;
        }
        
        const newAI = {
            id: Date.now(),
            name,
            specialization,
            description,
            status: 'creating',
            createdAt: new Date()
        };
        
        this.aiAgents.push(newAI);
        this.hideAiCreationModal();
        
        // Clear form
        if (nameInput) nameInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        
        const response = `AI "${name}" создается... Это займет несколько минут.`;
        this.showMessage(response, 'soma');
        this.speakText(response);
        
        // Simulate AI creation process
        setTimeout(() => {
            newAI.status = 'active';
            const successResponse = `AI "${name}" успешно создан и готов к работе!`;
            this.showMessage(successResponse, 'soma');
            this.speakText(successResponse);
        }, 3000);
    }

    initializeModules() {
        // Initialize active modules
        this.activeModules.forEach(module => {
            this.initializeModule(module);
        });
    }

    initializeModule(moduleName) {
        console.log(`Initializing module: ${moduleName}`);
        // Here you would typically initialize specific module functionality
    }

    loadUserPreferences() {
        // Load user preferences from localStorage
        const preferences = localStorage.getItem('soma_preferences');
        if (preferences) {
            const prefs = JSON.parse(preferences);
            this.currentLanguage = prefs.language || 'ru';
            this.currentMode = prefs.mode || 'voice';
        }
    }

    saveUserPreferences() {
        const preferences = {
            language: this.currentLanguage,
            mode: this.currentMode,
            modules: Array.from(this.activeModules)
        };
        localStorage.setItem('soma_preferences', JSON.stringify(preferences));
    }
}

// Initialize SOMA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.soma = new SOMA();
    
    // Add some initial messages
    setTimeout(() => {
        const welcomeMessage = 'Привет! Я S.O.M.A. — ваш умный ассистент. Я готов помочь вам с любыми задачами. Попробуйте сказать "SOMA" или нажмите кнопку микрофона.';
        window.soma.showMessage(welcomeMessage, 'soma');
        window.soma.speakText(welcomeMessage);
    }, 1000);
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add some ambient animations
    setInterval(() => {
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach((bar, index) => {
            if (Math.random() > 0.7) {
                bar.style.height = Math.random() * 60 + 20 + 'px';
            }
        });
    }, 200);
}); 