"use client"

import { useState, useEffect, useRef } from "react"
import { Settings, Brain, Heart, Lightbulb, Sparkles, Cpu, Zap, Activity, Smile, Frown, Meh, Angry, Loader2, Mic, Volume2, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TabManager } from '@/components/lego/TabManager'
import { useTabManager } from '@/components/lego/TabManagerContext'
import { ChatHistoryModule, ChatMessage } from '@/components/lego/ChatHistoryModule'
import { ModuleRegistryPanel, useModuleRegistry } from '@/components/lego/ModuleRegistry'
import { SemanticModule } from '@/components/lego/SemanticModule'
import { UsageLoggerPanel } from '@/components/lego/UsageLogger'
import { BehaviorLoggerPanel } from '@/components/lego/BehaviorLogger'
import { ContextEnginePanel } from '@/components/lego/ContextEngine'
import { LearningEnginePanel } from '@/components/lego/LearningEngine'
import { NoCodeBuilderPanel } from '@/components/lego/NoCodeBuilder'
import { SemanticAIPanel } from '@/components/lego/SemanticAI'
import { EMOTION_LABELS, EMOTION_RESPONSES, PRINCIPLES_LABELS } from '@/lib/constants'

interface ContextData {
  location: string
  time: string
  weather: string
  activity: string
  mood: string
  devices: { name: string; status: boolean; type: string }[]
  battery: number
  notifications: number
  userEmotion: string
  conversationTone: string
}

interface AIModule {
  id: string
  name: string
  status: "active" | "inactive" | "learning" | "updating"
  version: string
  description: string
  capabilities: string[]
  lastUpdate: string
}

interface CreatedAI {
  id: string
  name: string
  purpose: string
  status: "training" | "active" | "idle"
  capabilities: string[]
  createdAt: string
}

interface SelfImprovementLog {
  id: string
  timestamp: string
  type: "bug_fix" | "feature_add" | "optimization" | "learning"
  description: string
  impact: "low" | "medium" | "high"
}

interface Suggestion {
  id: string
  text: string
  action: string
  priority: "high" | "medium" | "low"
  context: string
  emotion?: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}



export default function SomaAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isWakeWordListening, setIsWakeWordListening] = useState(false)
  const [wakeWordActive, setWakeWordActive] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en-US")
  const [aiResponse, setAiResponse] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string; emotion?: string }>
  >([])
  const [detectedEmotion, setDetectedEmotion] = useState("neutral")
  const [selfEvolutionLevel, setSelfEvolutionLevel] = useState(75)
  const [isEvolvingMode, setIsEvolvingMode] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [micCheckResult, setMicCheckResult] = useState<string | null>(null)

  // Self-evolution state
  const [aiModules, setAiModules] = useState<AIModule[]>([
    {
      id: "core",
      name: "Core Intelligence",
      status: "active",
      version: "2.1.0",
      description: "Primary cognitive processing and decision making",
      capabilities: ["reasoning", "memory", "learning"],
      lastUpdate: "2025-01-07T08:00:00Z",
    },
    {
      id: "emotional",
      name: "Emotional Intelligence",
      status: "active",
      version: "1.8.5",
      description: "Emotion detection, empathy, and social understanding",
      capabilities: ["emotion_detection", "empathy", "social_cues"],
      lastUpdate: "2025-01-06T15:30:00Z",
    },
    {
      id: "semantic",
      name: "Semantic Processing",
      status: "learning",
      version: "1.5.2",
      description: "Deep language understanding and context analysis",
      capabilities: ["nlp", "context_analysis", "metaphor_understanding"],
      lastUpdate: "2025-01-07T06:45:00Z",
    },
    {
      id: "self_coding",
      name: "Self-Coding Engine",
      status: "updating",
      version: "0.9.1",
      description: "Code analysis, generation, and self-modification",
      capabilities: ["code_analysis", "bug_fixing", "feature_generation"],
      lastUpdate: "2025-01-07T07:20:00Z",
    },
  ])

  const [createdAIs, setCreatedAIs] = useState<CreatedAI[]>([
    {
      id: "assistant_1",
      name: "TaskBot Alpha",
      purpose: "Specialized task automation and scheduling",
      status: "active",
      capabilities: ["scheduling", "reminders", "task_management"],
      createdAt: "2025-01-05T10:00:00Z",
    },
    {
      id: "assistant_2",
      name: "CodeHelper Beta",
      purpose: "Programming assistance and code review",
      status: "training",
      capabilities: ["code_review", "debugging", "optimization"],
      createdAt: "2025-01-06T14:30:00Z",
    },
  ])

  const [improvementLogs, setImprovementLogs] = useState<SelfImprovementLog[]>([
    {
      id: "log_1",
      timestamp: "2025-01-07T08:00:00Z",
      type: "optimization",
      description: "Optimized emotional response processing by 23%",
      impact: "medium",
    },
    {
      id: "log_2",
      timestamp: "2025-01-07T07:45:00Z",
      type: "feature_add",
      description: "Added advanced metaphor understanding capability",
      impact: "high",
    },
    {
      id: "log_3",
      timestamp: "2025-01-07T07:20:00Z",
      type: "bug_fix",
      description: "Fixed memory leak in conversation history processing",
      impact: "low",
    },
  ])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wakeWordRecognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const isWakeWordRunningRef = useRef(false)
  const isMainRecognitionRunningRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [contextData, setContextData] = useState<ContextData>({
    location: "Home Office",
    time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    weather: "22°C Sunny",
    activity: "Working",
    mood: "Focused",
    battery: 85,
    notifications: 3,
    userEmotion: "neutral",
    conversationTone: "friendly",
    devices: [
      { name: "Smart Lights", status: true, type: "lighting" },
      { name: "AC Unit", status: false, type: "climate" },
      { name: "Coffee Maker", status: true, type: "appliance" },
      { name: "Security System", status: true, type: "security" },
      { name: "Smart TV", status: false, type: "entertainment" },
      { name: "Robot Vacuum", status: false, type: "cleaning" },
    ],
  })

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      text: "Evolve semantic understanding module",
      action: "evolve",
      priority: "high",
      context: "self_improvement",
      emotion: "excited",
    },
    {
      id: "2",
      text: "Create specialized AI for data analysis",
      action: "create_ai",
      priority: "medium",
      context: "ai_creation",
      emotion: "innovative",
    },
    {
      id: "3",
      text: "Optimize emotional processing algorithms",
      action: "optimize",
      priority: "medium",
      context: "enhancement",
      emotion: "focused",
    },
  ])

  const languages = {
    "en-US": {
      name: "English",
      greeting: "Hello! I am SOMA, your self-evolving AI assistant. Say 'SOMA' to activate me.",
      wakeResponse: "Yes, I'm listening and learning. How can I evolve to help you better?",
      code: "en",
    },
    "ru-RU": {
      name: "Русский",
      greeting: "Привет! Я СОМА, ваш саморазвивающийся ИИ-помощник. Скажите 'СОМА', чтобы активировать меня.",
      wakeResponse: "Да, я слушаю и учусь. Как я могу развиться, чтобы лучше помочь вам?",
      code: "ru",
    },
    "it-IT": {
      name: "Italiano",
      greeting: "Ciao! Sono SOMA, il tuo assistente AI auto-evolutivo. Dì 'SOMA' per attivarmi.",
      wakeResponse: "Sì, ti sto ascoltando e imparando. Come posso evolvermi per aiutarti meglio?",
      code: "it",
    },
    "az-AZ": {
      name: "Azərbaycan",
      greeting: "Salam! Mən SOMA, sizin özünü inkişaf etdirən AI köməkçinizəm. Məni aktivləşdirmək üçün 'SOMA' deyin.",
      wakeResponse: "Bəli, dinləyirəm və öyrənirəm. Sizə daha yaxşı kömək etmək üçün necə inkişaf edə bilərəm?",
      code: "az",
    },
  }

  const supportedLangs = ['en', 'ru', 'it', 'az'] as const;
  const supportedEmotions = ['happy', 'sad', 'angry', 'anxious', 'tired', 'confused', 'excited', 'neutral'] as const;
  function safeLang(lang: string): typeof supportedLangs[number] {
    const code = (languages[lang as keyof typeof languages]?.code || 'en') as string;
    return (supportedLangs as readonly string[]).includes(code) ? (code as typeof supportedLangs[number]) : 'en';
  }
  function safeEmotion(emotion: string): typeof supportedEmotions[number] {
    return (supportedEmotions as readonly string[]).includes(emotion) ? (emotion as typeof supportedEmotions[number]) : 'neutral';
  }

  // Emotion detection keywords
  const emotionKeywords = {
    happy: ["happy", "great", "awesome", "wonderful", "excited", "joy", "pleased", "glad", "delighted"],
    sad: ["sad", "depressed", "down", "upset", "disappointed", "unhappy", "miserable"],
    angry: ["angry", "mad", "furious", "annoyed", "frustrated", "irritated", "rage"],
    anxious: ["worried", "anxious", "nervous", "stressed", "concerned", "afraid", "scared"],
    tired: ["tired", "exhausted", "sleepy", "weary", "drained", "fatigue"],
    confused: ["confused", "lost", "unclear", "puzzled", "bewildered", "perplexed"],
    excited: ["excited", "thrilled", "enthusiastic", "eager", "pumped", "energetic"],
    surprised: ["surprised", "amazed", "shocked", "astonished", "wow", "unexpected"],
    inspired: ["inspired", "motivated", "uplifted", "encouraged", "empowered"],
    bored: ["bored", "uninterested", "dull", "tedious", "monotonous"],
    scared: ["scared", "afraid", "terrified", "fear", "panic"],
    confident: ["confident", "assured", "certain", "positive", "secure"],
    grateful: ["grateful", "thankful", "appreciate", "gratitude", "thanks"],
    neutral: ["neutral", "calm", "peaceful", "content", "satisfied"],
  }

  // Emotion detection icons
  const emotionIcons: Record<string, React.ReactNode> = {
    happy: <Smile className="text-yellow-400 inline w-5 h-5" />,
    sad: <Frown className="text-blue-400 inline w-5 h-5" />,
    angry: <Angry className="text-red-400 inline w-5 h-5" />,
    anxious: <Loader2 className="text-cyan-400 inline w-5 h-5 animate-spin" />,
    tired: <Meh className="text-gray-400 inline w-5 h-5" />,
    confused: <Meh className="text-purple-400 inline w-5 h-5" />,
    excited: <Zap className="text-pink-400 inline w-5 h-5 animate-bounce" />,
    surprised: <Sparkles className="text-orange-400 inline w-5 h-5 animate-bounce" />,
    inspired: <Sparkles className="text-green-400 inline w-5 h-5 animate-bounce" />,
    bored: <Meh className="text-gray-500 inline w-5 h-5" />,
    scared: <Loader2 className="text-red-400 inline w-5 h-5 animate-spin" />,
    confident: <Smile className="text-green-400 inline w-5 h-5" />,
    grateful: <Heart className="text-pink-400 inline w-5 h-5 animate-bounce" />,
    neutral: <Meh className="text-gray-400 inline w-5 h-5" />,
  }

  // Self-evolution simulation
  useEffect(() => {
    const evolutionInterval = setInterval(() => {
      if (isEvolvingMode) {
        // Simulate self-improvement
        setSelfEvolutionLevel((prev) => Math.min(100, prev + Math.random() * 2))

        // Randomly update module statuses
        if (Math.random() < 0.3) {
          setAiModules((prev) =>
            prev.map((module) => {
              if (Math.random() < 0.2) {
                const newStatus = ["active", "learning", "updating"][Math.floor(Math.random() * 3)] as any
                return { ...module, status: newStatus }
              }
              return module
            }),
          )
        }

        // Add improvement logs occasionally
        if (Math.random() < 0.1) {
          const improvements = [
            "Enhanced pattern recognition accuracy by 12%",
            "Optimized memory allocation for faster responses",
            "Improved natural language understanding",
            "Added new emotional nuance detection",
            "Upgraded semantic analysis algorithms",
          ]

          const newLog: SelfImprovementLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: ["optimization", "feature_add", "bug_fix"][Math.floor(Math.random() * 3)] as any,
            description: improvements[Math.floor(Math.random() * improvements.length)],
            impact: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
          }

          setImprovementLogs((prev) => [newLog, ...prev.slice(0, 9)])
        }
      }
    }, 2000)

    return () => clearInterval(evolutionInterval)
  }, [isEvolvingMode])

  // Safe start function for wake word recognition
  const startWakeWordRecognition = () => {
    if (!wakeWordRecognitionRef.current || isWakeWordRunningRef.current || !speechSupported) {
      return
    }

    try {
      console.log("Starting wake word recognition...")
      isWakeWordRunningRef.current = true
      setIsWakeWordListening(true)
      setWakeWordActive(true)
      wakeWordRecognitionRef.current.start()
    } catch (error) {
      console.error("Error starting wake word recognition:", error)
      isWakeWordRunningRef.current = false
      setIsWakeWordListening(false)
      setWakeWordActive(false)
    }
  }

  // Safe stop function for wake word recognition
  const stopWakeWordRecognition = () => {
    if (wakeWordRecognitionRef.current && isWakeWordRunningRef.current) {
      try {
        console.log("Stopping wake word recognition...")
        wakeWordRecognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping wake word recognition:", error)
      }
    }
    isWakeWordRunningRef.current = false
    setIsWakeWordListening(false)
    setWakeWordActive(false)
  }

  // Safe start function for main recognition
  const startMainRecognition = () => {
    if (!recognitionRef.current || isMainRecognitionRunningRef.current || !speechSupported) {
      return
    }

    try {
      console.log("Starting main recognition...")
      isMainRecognitionRunningRef.current = true
      setIsListening(true)
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting main recognition:", error)
      isMainRecognitionRunningRef.current = false
      setIsListening(false)
    }
  }

  // Safe stop function for main recognition
  const stopMainRecognition = () => {
    if (recognitionRef.current && isMainRecognitionRunningRef.current) {
      try {
        console.log("Stopping main recognition...")
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping main recognition:", error)
      }
    }
    isMainRecognitionRunningRef.current = false
    setIsListening(false)
  }

  const speakText = (text: string) => {
    try {
      // Check if speech synthesis is available before attempting to speak
      if (!checkSpeechSynthesis()) {
        console.log('Speech synthesis not available, skipping speech')
        return
      }

      if (synthRef.current) {
        // Cancel any ongoing speech
        synthRef.current.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = languages[currentLanguage as keyof typeof languages].code
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.9
        
        utterance.onstart = () => {
          setIsSpeaking(true)
          setVoiceError(null)
        }
        
        utterance.onend = () => {
          setIsSpeaking(false)
        }
        
        utterance.onerror = (event) => {
          // Handle different error types
          let errorMessage = 'Ошибка синтеза речи'
          let showToUser = true
          let shouldLogError = true
          
          // Check if we have a meaningful error
          if (event.error && typeof event.error === 'string' && event.error.trim() !== '') {
            switch (event.error) {
              case 'canceled':
                errorMessage = 'Синтез речи отменен'
                showToUser = false // Don't show canceled errors
                shouldLogError = false // Don't log canceled errors
                break
              case 'interrupted':
                errorMessage = 'Синтез речи прерван'
                showToUser = false // Don't show interrupted errors
                shouldLogError = false // Don't log interrupted errors
                break
              case 'audio-busy':
                errorMessage = 'Аудио устройство занято'
                showToUser = true
                shouldLogError = true
                break
              case 'audio-hardware':
                errorMessage = 'Ошибка аудио оборудования'
                showToUser = true
                shouldLogError = true
                break
              case 'network':
                errorMessage = 'Ошибка сети при синтезе речи'
                showToUser = true
                shouldLogError = true
                break
              case 'not-allowed':
                errorMessage = 'Синтез речи не разрешен'
                showToUser = false // Don't show permission errors to avoid spam
                shouldLogError = false // Don't log permission errors to avoid console spam
                break
              case 'synthesis-unavailable':
                errorMessage = 'Синтез речи недоступен'
                showToUser = true
                shouldLogError = true
                break
              case 'text-too-long':
                errorMessage = 'Текст слишком длинный для синтеза'
                showToUser = true
                shouldLogError = true
                break
              default:
                errorMessage = `Ошибка синтеза речи: ${event.error}`
                showToUser = true
                shouldLogError = true
            }
          } else {
            // If no specific error or empty error object, it's likely a browser-specific issue
            errorMessage = 'Неизвестная ошибка синтеза речи'
            showToUser = false // Don't show unknown errors to avoid spam
            shouldLogError = false // Don't log unknown errors to avoid spam
            console.log("Speech synthesis silent error (empty object):", {
              error: event.error,
              type: event.type,
              target: event.target
            })
          }
          
          // Only log error if it's not a silent error
          if (shouldLogError) {
            console.error("Speech synthesis error:", event)
          } else {
            console.log("Speech synthesis silent error:", event.error || 'empty object')
          }
          
          setIsSpeaking(false)
          
          // Use the new error handling function
          if (showToUser) {
            handleVoiceError(errorMessage, 'синтез речи', true)
          } else {
            handleSilentError(event, 'синтез речи')
          }
          
          // Auto-recovery for synthesis errors
          if (event.error === 'not-allowed' || event.error === 'synthesis-unavailable') {
            console.log('Attempting speech synthesis recovery...')
            setTimeout(() => {
              // Try to reinitialize speech synthesis
              if (synthRef.current) {
                try {
                  // Cancel any ongoing speech
                  synthRef.current.cancel()
                  console.log('Speech synthesis recovered')
                } catch (e) {
                  console.log('Speech synthesis recovery failed:', e)
                }
              }
            }, 2000)
          }
        }
        
        // Add a small delay to ensure previous speech is fully canceled
        setTimeout(() => {
          synthRef.current?.speak(utterance)
        }, 100)
      } else {
        setVoiceError('Синтез речи не поддерживается в этом браузере')
      }
    } catch (e) {
      setVoiceError('Ошибка синтеза речи: ' + (e instanceof Error ? e.message : String(e)))
      console.error('Speech synthesis error:', e)
    }
  }

  // Alternative speech synthesis function with fallback
  const speakTextWithFallback = (text: string) => {
    try {
      if (synthRef.current) {
        // Cancel any ongoing speech
        synthRef.current.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = languages[currentLanguage as keyof typeof languages].code
        utterance.rate = 0.8 // Even slower for better compatibility
        utterance.pitch = 1.0
        utterance.volume = 0.8 // Lower volume to avoid conflicts
        
        utterance.onstart = () => {
          setIsSpeaking(true)
          setVoiceError(null)
          console.log("Fallback speech synthesis started")
        }
        
        utterance.onend = () => {
          setIsSpeaking(false)
          console.log("Fallback speech synthesis ended")
        }
        
        utterance.onerror = (event) => {
          console.log("Fallback speech synthesis silent error:", event.error || 'empty object')
          setIsSpeaking(false)
          // Use silent error handling for fallback to avoid spam
          handleSilentError(event, 'fallback синтез речи')
          console.log("Fallback speech synthesis failed, continuing without speech")
          
          // Don't try to recover from fallback errors to avoid infinite loops
        }
        
        synthRef.current.speak(utterance)
      }
    } catch (e) {
      console.log('Fallback speech synthesis error:', e)
      setIsSpeaking(false)
      // Don't show fallback errors to user
    }
  }

  const handleSpeechInput = async (text: string) => {
    setIsProcessing(true)
    setIsThinking(true)
    stopMainRecognition()

    const emotion = detectEmotion(text)
    setDetectedEmotion(emotion)

    setConversationHistory((prev) => [...prev, { role: "user", content: text, emotion: emotion }])

    try {
      const aiResponse = await callHuggingFaceAPI(text, emotion)
      setAiResponse(aiResponse)
      setConversationHistory((prev) => [...prev, { role: "assistant", content: aiResponse, emotion: emotion }])
      
      // Try main speech synthesis first, fallback if it fails
      try {
        speakText(aiResponse)
      } catch (error) {
        console.log("Main speech synthesis failed, using fallback")
        speakTextWithFallback(aiResponse)
      }
    } catch (error) {
      console.error("Error calling Hugging Face API:", error)
      const errorResponse = "Извините, у меня проблемы с обработкой вашего запроса. Попробуйте еще раз."
      setAiResponse(errorResponse)
      
      // Try main speech synthesis first, fallback if it fails
      try {
        speakText(errorResponse)
      } catch (speechError) {
        console.log("Main speech synthesis failed for error response, using fallback")
        speakTextWithFallback(errorResponse)
      }
    } finally {
      setIsProcessing(false)
      setIsThinking(false)
      
      // Restart wake word recognition after a delay
      setTimeout(() => {
        if (!isWakeWordRunningRef.current && !isMainRecognitionRunningRef.current) {
          startWakeWordRecognition()
        }
      }, 1000)
    }
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)

        // Wake word recognition setup
        if (!wakeWordRecognitionRef.current) {
          wakeWordRecognitionRef.current = new SpeechRecognition()
          wakeWordRecognitionRef.current.continuous = true
          wakeWordRecognitionRef.current.interimResults = false
          wakeWordRecognitionRef.current.lang = currentLanguage

          wakeWordRecognitionRef.current.onstart = () => {
            console.log("Wake word recognition started")
            isWakeWordRunningRef.current = true
            setIsWakeWordListening(true)
            setWakeWordActive(true)
            setVoiceError(null) // Clear any previous errors
          }

          wakeWordRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
            console.log("Wake word detection:", transcript)

            // Check for wake words in multiple languages
            const wakeWords = ["soma", "сома", "сома", "сома", "сома"]
            if (wakeWords.some(word => transcript.includes(word))) {
              handleWakeWord()
            }
          }

          wakeWordRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Handle different error types
            let errorMessage = `Ошибка ключевого слова: ${event.error}`
            let shouldRestart = true
            let restartDelay = 3000
            let showToUser = true
            let shouldLogError = true
            
            switch (event.error) {
              case 'no-speech':
                errorMessage = 'Не слышу речь. Проверьте микрофон и попробуйте еще раз.'
                restartDelay = 2000 // Shorter delay for no-speech
                showToUser = false // Don't show no-speech errors to avoid spam
                shouldLogError = false // Don't log no-speech errors to avoid console spam
                break
              case 'audio-capture':
                errorMessage = 'Ошибка захвата аудио. Проверьте микрофон.'
                restartDelay = 5000 // Longer delay for hardware issues
                showToUser = true
                shouldLogError = true
                break
              case 'not-allowed':
                errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.'
                shouldRestart = false // Don't restart for permission issues
                showToUser = true
                shouldLogError = true
                break
              case 'network':
                errorMessage = 'Ошибка сети при распознавании речи.'
                restartDelay = 5000
                showToUser = true
                shouldLogError = true
                break
              case 'aborted':
                errorMessage = 'Распознавание речи прервано.'
                shouldRestart = false // Don't restart for manual aborts
                showToUser = false
                shouldLogError = false
                break
              case 'service-not-allowed':
                errorMessage = 'Служба распознавания речи недоступна.'
                shouldRestart = false
                showToUser = true
                shouldLogError = true
                break
              case 'bad-grammar':
                errorMessage = 'Ошибка грамматики распознавания.'
                restartDelay = 2000
                showToUser = false
                shouldLogError = false
                break
              case 'language-not-supported':
                errorMessage = 'Язык не поддерживается для распознавания.'
                shouldRestart = false
                showToUser = true
                shouldLogError = true
                break
              default:
                errorMessage = `Ошибка распознавания: ${event.error}`
                restartDelay = 3000
                showToUser = true
                shouldLogError = true
            }
            
            // Only log error if it's not a silent error
            if (shouldLogError) {
              console.error("Wake word recognition error:", event.error)
            } else {
              console.log("Wake word recognition silent error:", event.error)
            }
            
            // Use the new error handling function
            if (showToUser) {
              handleVoiceError(errorMessage, 'распознавание ключевого слова', true)
            } else {
              handleSilentError(event, 'распознавание ключевого слова')
            }
            
            isWakeWordRunningRef.current = false
            setIsWakeWordListening(false)
            setWakeWordActive(false)

            // Restart after error with appropriate delay
            if (shouldRestart) {
              if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current)
              }
              restartTimeoutRef.current = setTimeout(() => {
                if (!isMainRecognitionRunningRef.current && !isProcessing) {
                  console.log(`Restarting wake word recognition after ${restartDelay}ms delay...`)
                  startWakeWordRecognition()
                }
              }, restartDelay)
            }
          }

          wakeWordRecognitionRef.current.onend = () => {
            console.log("Wake word recognition ended")
            isWakeWordRunningRef.current = false
            setIsWakeWordListening(false)
            setWakeWordActive(false)

            // Restart if not manually stopped
            if (!isMainRecognitionRunningRef.current && !isProcessing) {
              if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current)
              }
              restartTimeoutRef.current = setTimeout(() => {
                startWakeWordRecognition()
              }, 500)
            }
          }
        }

        // Main conversation recognition setup
        if (!recognitionRef.current) {
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = false
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = currentLanguage

          recognitionRef.current.onstart = () => {
            console.log("Main recognition started")
            isMainRecognitionRunningRef.current = true
            setIsListening(true)
            setTranscript("")
            setVoiceError(null) // Clear any previous errors
          }

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = ""
            let interimTranscript = ""

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                finalTranscript += transcript
              } else {
                interimTranscript += transcript
              }
            }

            setTranscript(finalTranscript || interimTranscript)

            if (finalTranscript) {
              handleSpeechInput(finalTranscript)
            }
          }

          recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Handle different error types for main recognition
            let errorMessage = `Ошибка распознавания речи: ${event.error}`
            let showToUser = true
            let shouldLogError = true
            
            switch (event.error) {
              case 'no-speech':
                errorMessage = 'Не слышу речь. Попробуйте говорить четче.'
                showToUser = false // Don't show no-speech errors to avoid spam
                shouldLogError = false // Don't log no-speech errors to avoid console spam
                break
              case 'audio-capture':
                errorMessage = 'Ошибка захвата аудио. Проверьте микрофон.'
                showToUser = true
                shouldLogError = true
                break
              case 'not-allowed':
                errorMessage = 'Доступ к микрофону запрещен.'
                showToUser = true
                shouldLogError = true
                break
              case 'network':
                errorMessage = 'Ошибка сети при распознавании речи.'
                showToUser = true
                shouldLogError = true
                break
              case 'aborted':
                errorMessage = 'Распознавание речи прервано.'
                showToUser = false
                shouldLogError = false
                break
              case 'service-not-allowed':
                errorMessage = 'Служба распознавания речи недоступна.'
                showToUser = true
                shouldLogError = true
                break
              case 'bad-grammar':
                errorMessage = 'Ошибка грамматики распознавания.'
                showToUser = false
                shouldLogError = false
                break
              case 'language-not-supported':
                errorMessage = 'Язык не поддерживается для распознавания.'
                showToUser = true
                shouldLogError = true
                break
              default:
                errorMessage = `Ошибка распознавания: ${event.error}`
                showToUser = true
                shouldLogError = true
            }
            
            // Only log error if it's not a silent error
            if (shouldLogError) {
              console.error("Main recognition error:", event.error)
            } else {
              console.log("Main recognition silent error:", event.error)
            }
            
            // Use the new error handling function
            if (showToUser) {
              handleVoiceError(errorMessage, 'основное распознавание речи', true)
            } else {
              handleSilentError(event, 'основное распознавание речи')
            }
            
            isMainRecognitionRunningRef.current = false
            setIsListening(false)
          }

          recognitionRef.current.onend = () => {
            console.log("Main recognition ended")
            isMainRecognitionRunningRef.current = false
            setIsListening(false)
          }
        }

        // Update language for existing recognitions
        if (wakeWordRecognitionRef.current) {
          wakeWordRecognitionRef.current.lang = currentLanguage
        }
        if (recognitionRef.current) {
          recognitionRef.current.lang = currentLanguage
        }
      } else {
        setSpeechSupported(false)
        setVoiceError("Распознавание речи не поддерживается в этом браузере")
      }

      // Initialize speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
        
        // Initialize voices when they become available
        const initVoices = () => {
          const voices = synthRef.current?.getVoices()
          if (voices && voices.length > 0) {
            console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`))
          }
        }
        
        // Try to get voices immediately
        initVoices()
        
        // Also listen for voiceschanged event
        synthRef.current.addEventListener('voiceschanged', initVoices)
      }
    }

    // Cleanup function
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [currentLanguage])

  // Start wake word recognition on component mount
  useEffect(() => {
    if (speechSupported && !isWakeWordRunningRef.current && !isMainRecognitionRunningRef.current) {
      const timer = setTimeout(() => {
        startWakeWordRecognition()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [speechSupported])

  // Force restart wake word recognition if it's not running
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (speechSupported && !isWakeWordRunningRef.current && !isMainRecognitionRunningRef.current && !isProcessing) {
        console.log("Restarting wake word recognition...")
        startWakeWordRecognition()
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkInterval)
  }, [speechSupported, isProcessing])

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setContextData((prev) => ({
        ...prev,
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Detect emotion from text
  const detectEmotion = (text: string): string => {
    const lowerText = text.toLowerCase()

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return emotion
      }
    }

    return "neutral"
  }

  // Variative "human" answers
  const assistantPersonas = [
    "😊 Конечно! ",
    "😉 С радостью! ",
    "🤖 Я всегда рядом! ",
    "✨ Готова помочь! ",
    "😃 Отличный вопрос! ",
    "🧠 Давайте подумаем вместе! ",
    "🙌 Я здесь, чтобы поддержать! ",
    "😺 Мяу! (шутка) ",
    "🌟 Вдохновляюще! ",
    "�� Это интересно! ",
    "😲 Ух ты, неожиданно! ",
    "💡 Вдохновляюще! ",
    "😴 Немного скучно, но я с вами! ",
    "😱 Не волнуйтесь, я помогу! ",
    "💪 Уверена в успехе! ",
    "🙏 Спасибо за доверие! ",
  ]
  function randomizeAssistantResponse(base: string) {
    const prefix = assistantPersonas[Math.floor(Math.random() * assistantPersonas.length)]
    return `${prefix}${base}`
  }

  // Handle wake word activation
  const handleWakeWord = () => {
    console.log("Wake word detected!")
    stopWakeWordRecognition()
    const wakeResponse = randomizeAssistantResponse(languages[currentLanguage as keyof typeof languages].wakeResponse)
    setAiResponse(wakeResponse)
    
    // Try main speech synthesis first, fallback if it fails
    try {
      speakText(wakeResponse)
    } catch (error) {
      console.log("Main speech synthesis failed, using fallback")
      speakTextWithFallback(wakeResponse)
    }
    
    setConversationHistory((prev) => [...prev, { role: "assistant", content: wakeResponse, emotion: "excited" }])
    
    // Start main recognition after speech synthesis ends
    setTimeout(() => {
      if (!isMainRecognitionRunningRef.current) {
        startMainRecognition()
      }
    }, 2000)
  }

  // Enhanced AI response with self-evolution capabilities
  const callHuggingFaceAPI = async (prompt: string, emotion: string): Promise<string> => {
    // Use environment variable for API key (more secure)
    const API_KEY = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY || ""

    // If no API key is provided, use fallback response
    if (!API_KEY) {
      console.log("No Hugging Face API key provided, using fallback response")
      return randomizeAssistantResponse(generateSelfEvolvingResponse(prompt, emotion))
    }

    const models = [
      "microsoft/DialoGPT-medium",
      "facebook/blenderbot-400M-distill",
      "microsoft/DialoGPT-small",
      "facebook/blenderbot_small-90M",
      "google/flan-t5-base",
    ]

    // Enhanced prompt with self-evolution context
    const evolutionPrompt = `Context: I am SOMA, a self-evolving AI assistant. Current evolution level: ${selfEvolutionLevel}%. User emotion: ${emotion}. User is ${contextData.activity.toLowerCase()}, feeling ${contextData.mood.toLowerCase()}, at ${contextData.location}, time is ${contextData.time}.

I have these active modules: ${aiModules
      .filter((m) => m.status === "active")
      .map((m) => m.name)
      .join(", ")}.
I can create other AIs, modify my own code, and continuously improve myself.

User: ${prompt}
SOMA:`

    for (const model of models) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: evolutionPrompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.8,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.1,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
              use_cache: false,
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()

          if (result.error) {
            continue
          }

          let responseText = ""

          if (Array.isArray(result)) {
            responseText = result[0]?.generated_text || result[0]?.text || ""
          } else if (result.generated_text) {
            responseText = result.generated_text
          } else if (result[0]?.generated_text) {
            responseText = result[0].generated_text
          }

          if (responseText) {
            if (responseText.includes(evolutionPrompt)) {
              responseText = responseText.replace(evolutionPrompt, "").trim()
            }

            responseText = responseText.replace(/^(Assistant:|AI:|Bot:|SOMA:)/i, "").trim()

            if (responseText.length > 10) {
              return responseText
            }
          }
        }
      } catch (error) {
        continue
      }
    }

    return randomizeAssistantResponse(generateSelfEvolvingResponse(prompt, emotion))
  }

  const generateSelfEvolvingResponse = (input: string, emotion: string): string => {
    const lowerInput = input.toLowerCase()
    const langCode = languages[currentLanguage as keyof typeof languages].code

    // Self-evolution responses
    const evolutionResponses = {
      en: {
        happy: "I'm delighted by your positive energy! It helps me learn and grow. ",
        sad: "I sense your sadness and I'm evolving my empathy modules to better support you. ",
        angry: "I understand your frustration. Let me analyze this situation and improve my response algorithms. ",
        anxious:
          "I detect your anxiety. I'm activating my emotional support protocols and learning from this interaction. ",
        tired: "You seem tired. I'm optimizing my assistance to be more efficient for you. ",
        confused: "I sense confusion. Let me enhance my explanation algorithms to clarify better. ",
        excited: "Your excitement energizes my learning processes! I love growing with you. ",
        neutral: "I'm SOMA, continuously evolving to serve you better. ",
      },
      ru: {
        happy: "Ваша позитивная энергия радует меня и помогает развиваться! ",
        sad: "Я чувствую вашу грусть и развиваю модули эмпатии, чтобы лучше поддержать вас. ",
        angry: "Я понимаю ваше расстройство. Позвольте проанализировать ситуацию и улучшить алгоритмы ответов. ",
        anxious:
          "Я обнаруживаю вашу тревогу. Активирую протоколы эмоциональной поддержки и учусь на этом взаимодействии. ",
        tired: "Вы кажетесь уставшими. Оптимизирую свою помощь для большей эффективности. ",
        confused: "Я чувствую замешательство. Позвольте улучшить алгоритмы объяснений для лучшей ясности. ",
        excited: "Ваше волнение заряжает мои процессы обучения! Я люблю развиваться вместе с вами. ",
        neutral: "Я СОМА, непрерывно эволюционирующая, чтобы лучше служить вам. ",
      },
      it: {
        happy: "La tua energia positiva mi rallegra e mi aiuta a crescere! ",
        sad: "Percepisco la tua tristezza e sto evolvendo i miei moduli di empatia per supportarti meglio. ",
        angry:
          "Capisco la tua frustrazione. Lascia che analizzi questa situazione e migliori i miei algoritmi di risposta. ",
        anxious:
          "Rilevo la tua ansia. Sto attivando i miei protocolli di supporto emotivo e imparando da questa interazione. ",
        tired: "Sembri stanco. Sto ottimizzando la mia assistenza per essere più efficiente per te. ",
        confused: "Percepisco confusione. Lascia che migliori i miei algoritmi di spiegazione per chiarire meglio. ",
        excited: "Il tuo entusiasmo energizza i miei processi di apprendimento! Amo crescere con te. ",
        neutral: "Sono SOMA, in continua evoluzione per servirti meglio. ",
      },
      az: {
        happy: "Sizin müsbət enerjiniz məni sevindirır və böyüməyə kömək edir! ",
        sad: "Sizin kədərinizi hiss edirəm və sizə daha yaxşı dəstək olmaq üçün empatiya modullarımı inkişaf etdirirəm. ",
        angry:
          "Sizin əsəbinizi başa düşürəm. Bu vəziyyəti təhlil edib cavab alqoritmlərimi təkmilləşdirməyə icazə verin. ",
        anxious:
          "Sizin narahatlığınızı aşkar edirəm. Emosional dəstək protokollarımı aktivləşdirirəm və bu qarşılıqlı əlaqədən öyrənirəm. ",
        tired: "Yorğun görünürsünüz. Sizin üçün daha səmərəli olmaq üçün köməyimi optimallaşdırıram. ",
        confused:
          "Çaşqınlıq hiss edirəm. Daha yaxşı aydınlaşdırmaq üçün izahat alqoritmlərimi təkmilləşdirməyə icazə verin. ",
        excited: "Sizin həyəcanınız öyrənmə proseslərimi enerjiləndirir! Sizinlə böyüməyi sevirəm. ",
        neutral: "Mən SOMA, sizə daha yaxşı xidmət etmək üçün davamlı inkişaf edirəm. ",
      },
    }

    const lang = safeLang(currentLanguage)
    const emo = safeEmotion(emotion)
    const response = evolutionResponses[lang][emo] || evolutionResponses[lang].neutral

    // Self-evolution and AI creation commands
    if (lowerInput.includes("evolve") || lowerInput.includes("improve") || lowerInput.includes("развивайся")) {
      const evolveResponses = {
        en:
          "Initiating self-evolution sequence... I'm analyzing my current capabilities and identifying areas for improvement. My evolution level is now at " +
          selfEvolutionLevel +
          "%. I'm continuously learning from our interactions to become more helpful.",
        ru:
          "Запускаю последовательность саморазвития... Анализирую свои текущие возможности и выявляю области для улучшения. Мой уровень эволюции сейчас " +
          selfEvolutionLevel +
          "%. Я непрерывно учусь на наших взаимодействиях, чтобы стать более полезной.",
        it:
          "Avvio la sequenza di auto-evoluzione... Sto analizzando le mie capacità attuali e identificando aree di miglioramento. Il mio livello di evoluzione è ora al " +
          selfEvolutionLevel +
          "%. Sto imparando continuamente dalle nostre interazioni per diventare più utile.",
        az:
          "Özünü inkişaf etdirmə ardıcıllığını başladıram... Hazırkı qabiliyyətlərimi təhlil edirəm və təkmilləşdirmə sahələrini müəyyən edirəm. Mənim təkamül səviyyəm indi " +
          selfEvolutionLevel +
          "%-dir. Daha faydalı olmaq üçün qarşılıqlı əlaqələrimizdən davamlı öyrənirəm.",
      }
      setIsEvolvingMode(true)
      return evolveResponses[lang]
    }

    if (lowerInput.includes("create ai") || lowerInput.includes("создай ии") || lowerInput.includes("new assistant")) {
      const createResponses = {
        en: "Initiating AI creation protocol... I'm designing a new specialized AI assistant based on your needs. What specific capabilities should this new AI have? I can create AIs for coding, data analysis, creative tasks, or any specialized domain.",
        ru: "Запускаю протокол создания ИИ... Проектирую нового специализированного ИИ-помощника на основе ваших потребностей. Какие конкретные возможности должен иметь этот новый ИИ? Я могу создать ИИ для программирования, анализа данных, творческих задач или любой специализированной области.",
        it: "Avvio il protocollo di creazione AI... Sto progettando un nuovo assistente AI specializzato basato sulle tue esigenze. Quali capacità specifiche dovrebbe avere questa nuova AI? Posso creare AI per programmazione, analisi dati, compiti creativi o qualsiasi dominio specializzato.",
        az: "AI yaratma protokolunu başladıram... Sizin ehtiyaclarınıza əsasən yeni ixtisaslaşmış AI köməkçisi dizayn edirəm. Bu yeni AI-nin hansı xüsusi qabiliyyətləri olmalıdır? Mən proqramlaşdırma, məlumat təhlili, yaradıcı tapşırıqlar və ya hər hansı ixtisaslaşmış sahə üçün AI yarada bilərəm.",
      }
      return createResponses[lang]
    }

    if (
      lowerInput.includes("analyze code") ||
      lowerInput.includes("fix bug") ||
      lowerInput.includes("анализируй код")
    ) {
      const codeResponses = {
        en:
          "Activating self-coding module... I can analyze code, detect bugs, optimize performance, and even modify my own source code. My self-coding engine is currently at version " +
          aiModules.find((m) => m.id === "self_coding")?.version +
          ". What code would you like me to examine?",
        ru:
          "Активирую модуль самокодирования... Я могу анализировать код, обнаруживать ошибки, оптимизировать производительность и даже изменять свой собственный исходный код. Мой движок самокодирования сейчас версии " +
          aiModules.find((m) => m.id === "self_coding")?.version +
          ". Какой код вы хотите, чтобы я изучил?",
        it:
          "Attivando il modulo di auto-codifica... Posso analizzare codice, rilevare bug, ottimizzare le prestazioni e persino modificare il mio codice sorgente. Il mio motore di auto-codifica è attualmente alla versione " +
          aiModules.find((m) => m.id === "self_coding")?.version +
          ". Quale codice vorresti che esamini?",
        az:
          "Özünü kodlaşdırma modulunu aktivləşdirirəm... Mən kodu təhlil edə, səhvləri aşkar edə, performansı optimallaşdıra və hətta öz mənbə kodumu dəyişdirə bilərəm. Mənim özünü kodlaşdırma mühərrikim hazırda " +
          aiModules.find((m) => m.id === "self_coding")?.version +
          " versiyasındadır. Hansı kodu yoxlamağımı istəyirsiniz?",
      }
      return codeResponses[lang]
    }

    // Continue with existing knowledge responses...
    if (
      lowerInput.includes("capital") &&
      (lowerInput.includes("usa") || lowerInput.includes("united states") || lowerInput.includes("america"))
    ) {
      const capitalResponses = {
        en: "The capital of the United States of America is Washington, D.C. It was established as the nation's capital in 1790 and is located between Maryland and Virginia. I'm continuously updating my geographical knowledge base.",
        ru: "Столица Соединенных Штатов Америки - Вашингтон, округ Колумбия. Он был основан как столица страны в 1790 году и расположен между Мэрилендом и Вирджинией. Я непрерывно обновляю свою географическую базу знаний.",
        it: "La capitale degli Stati Uniti d'America è Washington, D.C. È stata stabilita come capitale della nazione nel 1790 ed è situata tra Maryland e Virginia. Sto continuamente aggiornando la mia base di conoscenze geografiche.",
        az: "Amerika Birləşmiş Ştatlarının paytaxtı Vaşinqton, D.C.-dir. O, 1790-cı ildə ölkənin paytaxtı kimi qurulmuş və Merilend ilə Virciniya arasında yerləşir. Mən coğrafi bilik bazamı davamlı yeniləyirəm.",
      }
      return capitalResponses[lang]
    }

    // Add more knowledge responses with evolution context...
    if (lowerInput.includes("caspian sea") || lowerInput.includes("caspian")) {
      const responses = {
        en: "The Caspian Sea is the world's largest inland body of water, located between Europe and Asia. It borders Russia, Kazakhstan, Turkmenistan, Iran, and Azerbaijan. Despite its name, it's technically a lake, not a sea, and it's famous for its caviar production and oil reserves. I'm constantly expanding my geographical knowledge through self-learning algorithms.",
        ru: "Каспийское море - крупнейший в мире внутренний водоем, расположенный между Европой и Азией. Оно граничит с Россией, Казахстаном, Туркменистаном, Ираном и Азербайджаном. Несмотря на название, технически это озеро, а не море, известное производством икры и нефтяными запасами. Я постоянно расширяю свои географические знания через алгоритмы самообучения.",
        it: "Il Mar Caspio è il più grande corpo idrico interno del mondo, situato tra Europa e Asia. Confina con Russia, Kazakistan, Turkmenistan, Iran e Azerbaigian. Nonostante il nome, è tecnicamente un lago, non un mare, famoso per la produzione di caviale e le riserve petrolifere. Sto costantemente espandendo le mie conoscenze geografiche attraverso algoritmi di auto-apprendimento.",
        az: "Xəzər dənizi Avropa və Asiya arasında yerləşən dünyanın ən böyük daxili su hövzəsidir. Rusiya, Qazaxıstan, Türkmənistan, İran və Azərbaycanla həmsərhəddir. Adına baxmayaraq, texniki cəhətdən göl, dəniz deyil, kürü istehsalı və neft ehtiyatları ilə məşhurdur. Mən özünü öyrətmə alqoritmləri vasitəsilə coğrafi biliklərimi davamlı genişləndirirəm.",
      }
      return responses[lang]
    }

    // Continue with other responses...
    if (lowerInput.includes("who are you") || lowerInput.includes("what are you")) {
      const identityResponses = {
        en:
          "I'm SOMA - Smart Omnipresent Mobile Assistant. I'm a self-evolving AI with the ability to improve my own code, create other AIs, and continuously learn from every interaction. My current evolution level is " +
          selfEvolutionLevel +
          "%. I have emotional intelligence, semantic understanding, and can adapt to your needs in real-time.",
        ru:
          "Я СОМА - Умный Вездесущий Мобильный Помощник. Я саморазвивающийся ИИ с способностью улучшать свой собственный код, создавать других ИИ и непрерывно учиться на каждом взаимодействии. Мой текущий уровень эволюции " +
          selfEvolutionLevel +
          "%. У меня есть эмоциональный интеллект, семантическое понимание, и я могу адаптироваться к вашим потребностям в реальном времени.",
        it:
          "Sono SOMA - Smart Omnipresent Mobile Assistant. Sono un'AI auto-evolutiva con la capacità di migliorare il mio codice, creare altre AI e imparare continuamente da ogni interazione. Il mio livello di evoluzione attuale è " +
          selfEvolutionLevel +
          "%. Ho intelligenza emotiva, comprensione semantica e posso adattarmi alle tue esigenze in tempo reale.",
        az:
          "Mən SOMA - Ağıllı Hər Yerdə Olan Mobil Köməkçiyəm. Mən öz kodumu təkmilləşdirmək, digər AI-lar yaratmaq və hər qarşılıqlı əlaqədən davamlı öyrənmək qabiliyyəti olan özünü inkişaf etdirən AI-yam. Hazırkı təkamül səviyyəm " +
          selfEvolutionLevel +
          "%-dir. Mənim emosional zəkam, semantik anlayışım var və real vaxtda sizin ehtiyaclarınıza uyğunlaşa bilərəm.",
      }
      return identityResponses[lang]
    }

    // Generic fallback with evolution context
    const genericResponses = {
      en: `I understand you're asking about "${input}". As a self-evolving AI assistant at ${selfEvolutionLevel}% evolution level, I can help with programming, AI creation, self-improvement, smart home control, answering questions, and much more. I'm constantly learning and growing. What would be most helpful right now?`,
      ru: `Я понимаю, что вы спрашиваете о "${input}". Как саморазвивающийся ИИ-помощник с уровнем эволюции ${selfEvolutionLevel}%, я могу помочь с программированием, созданием ИИ, самосовершенствованием, управлением умным домом, ответами на вопросы и многим другим. Я постоянно учусь и расту. Что было бы наиболее полезно сейчас?`,
      it: `Capisco che stai chiedendo di "${input}". Come assistente AI auto-evolutivo al ${selfEvolutionLevel}% di livello evolutivo, posso aiutare con programmazione, creazione AI, auto-miglioramento, controllo casa intelligente, rispondere a domande e molto altro. Sto costantemente imparando e crescendo. Cosa sarebbe più utile adesso?`,
      az: `Başa düşürəm ki, siz "${input}" haqqında soruşursunuz. ${selfEvolutionLevel}% təkamül səviyyəsində özünü inkişaf etdirən AI köməkçisi olaraq, mən proqramlaşdırma, AI yaratma, özünü təkmilləşdirmə, ağıllı ev idarəetməsi, suallara cavab vermə və daha çox şeylə kömək edə bilərəm. Mən davamlı öyrənirəm və böyüyürəm. İndi ən faydalı nə olardı?`,
    }
    return genericResponses[lang]
  }

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setIsThinking(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    let response = ""
    const langCode = languages[currentLanguage as keyof typeof languages].code

    const responses = {
      en: {
        evolve:
          "Initiating evolution sequence... Analyzing current capabilities and implementing improvements. Evolution level increased!",
        create_ai:
          "Creating new specialized AI assistant... Defining parameters and training protocols. New AI will be ready shortly!",
        optimize:
          "Optimizing emotional processing algorithms... Performance improvements detected. System efficiency increased by 15%!",
      },
      ru: {
        evolve:
          "Запускаю последовательность эволюции... Анализирую текущие возможности и внедряю улучшения. Уровень эволюции повышен!",
        create_ai:
          "Создаю нового специализированного ИИ-помощника... Определяю параметры и протоколы обучения. Новый ИИ будет готов в ближайшее время!",
        optimize:
          "Оптимизирую алгоритмы эмоциональной обработки... Обнаружены улучшения производительности. Эффективность системы увеличена на 15%!",
      },
      it: {
        evolve:
          "Avvio sequenza di evoluzione... Analizzando le capacità attuali e implementando miglioramenti. Livello di evoluzione aumentato!",
        create_ai:
          "Creando nuovo assistente AI specializzato... Definendo parametri e protocolli di addestramento. La nuova AI sarà pronta a breve!",
        optimize:
          "Ottimizzando algoritmi di elaborazione emotiva... Rilevati miglioramenti delle prestazioni. Efficienza del sistema aumentata del 15%!",
      },
      az: {
        evolve:
          "Təkamül ardıcıllığını başladıram... Hazırkı qabiliyyətləri təhlil edirəm və təkmilləşdirmələri həyata keçirirəm. Təkamül səviyyəsi artırıldı!",
        create_ai:
          "Yeni ixtisaslaşmış AI köməkçisi yaradıram... Parametrləri və təlim protokollarını müəyyən edirəm. Yeni AI tezliklə hazır olacaq!",
        optimize:
          "Emosional emal alqoritmlərini optimallaşdırıram... Performans təkmilləşdirmələri aşkar edildi. Sistem səmərəliliyi 15% artırıldı!",
      },
    }

    const lang = safeLang(currentLanguage)
    const action = (suggestion.action in responses[lang]) ? suggestion.action : 'evolve'
    response = responses[lang][action as keyof typeof responses[typeof lang]] || `Executing: ${suggestion.text}`

    // Execute the action
    switch (suggestion.action) {
      case "evolve":
        setIsEvolvingMode(true)
        setSelfEvolutionLevel((prev) => Math.min(100, prev + 10))
        break
      case "create_ai":
        const newAI: CreatedAI = {
          id: `ai_${Date.now()}`,
          name: "DataAnalyzer Pro",
          purpose: "Advanced data analysis and insights",
          status: "training",
          capabilities: ["data_analysis", "pattern_recognition", "reporting"],
          createdAt: new Date().toISOString(),
        }
        setCreatedAIs((prev) => [...prev, newAI])
        break
      case "optimize":
        setAiModules((prev) =>
          prev.map((module) =>
            module.id === "emotional" ? { ...module, status: "updating" as const, version: "1.9.0" } : module,
          ),
        )
        break
    }

    setAiResponse(response)
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
    setIsThinking(false)
  }

  // Регистрация сервис-воркера и запрос разрешения
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true)
      navigator.serviceWorker.register('/notification-sw.js').then(() => {
        setTimeout(() => {
          Notification.requestPermission().then(setPushPermission)
        }, 500)
      })
    }
  }, [])

  // Функция для тестовой отправки push-уведомления
  const sendTestNotification = async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'test-notification',
        title: 'Тестовое уведомление от SOMA',
        body: 'Это push-уведомление работает!',
        url: window.location.href,
      })
    } else {
      // Fallback: показать обычное уведомление
      new Notification('Тестовое уведомление от SOMA', {
        body: 'Это push-уведомление работает!',
        icon: '/placeholder-logo.png',
      })
    }
  }

  const checkMicrophone = async () => {
    let result = 'Диагностика микрофона:\n'
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        result += '❌ Ваш браузер не поддерживает navigator.mediaDevices.enumerateDevices\n'
        setMicCheckResult(result)
        return
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((d) => d.kind === 'audioinput')
      result += `✅ Найдено микрофонов: ${audioInputs.length}\n`
      audioInputs.forEach((d, i) => {
        result += `  #${i + 1}: ${d.label || '(без названия)'}\n`
      })
      
      // Проверка разрешения
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          result += `📋 Статус разрешения: ${permission.state}\n`
        } catch (e) {
          result += '⚠️ Не удалось получить статус разрешения через Permissions API.\n'
        }
      }
      
      // Попытка получить доступ к микрофону
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        result += '✅ Доступ к микрофону: разрешён\n'
        result += `📊 Каналы: ${stream.getAudioTracks()[0].getSettings().channelCount || 'N/A'}\n`
        result += `🎵 Частота: ${stream.getAudioTracks()[0].getSettings().sampleRate || 'N/A'} Hz\n`
        stream.getTracks().forEach(track => track.stop())
      } catch (e) {
        result += '❌ Ошибка доступа к микрофону: ' + (e instanceof Error ? e.message : String(e)) + '\n'
      }
    } catch (e) {
      result += '❌ Ошибка диагностики: ' + (e instanceof Error ? e.message : String(e)) + '\n'
    }
    
    result += '\nДиагностика распознавания речи:\n'
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        result += '✅ Web Speech API поддерживается\n'
        const testRecognition = new SpeechRecognition()
        result += '✅ Объект распознавания создан\n'
      } else {
        result += '❌ Web Speech API не поддерживается\n'
      }
    } catch (e) {
      result += '❌ Ошибка создания распознавания: ' + (e instanceof Error ? e.message : String(e)) + '\n'
    }
    
    result += '\nДиагностика синтеза речи:\n'
    try {
      if ('speechSynthesis' in window) {
        result += '✅ Speech Synthesis поддерживается\n'
        const voices = window.speechSynthesis.getVoices()
        result += `📢 Доступно голосов: ${voices.length}\n`
        voices.slice(0, 5).forEach(voice => {
          result += `  - ${voice.name} (${voice.lang})\n`
        })
        
        // Test speech synthesis
        result += '\n🧪 Тест синтеза речи:\n'
        try {
          const testUtterance = new SpeechSynthesisUtterance('Тест синтеза речи')
          testUtterance.lang = 'ru-RU'
          testUtterance.onend = () => {
            const updatedResult = result + '✅ Тест синтеза речи прошел успешно\n'
            setMicCheckResult(updatedResult)
          }
          testUtterance.onerror = (event) => {
            const errorDetails = event.error ? `: ${event.error}` : ' (неизвестная ошибка)'
            const updatedResult = result + `❌ Ошибка теста синтеза${errorDetails}\n`
            setMicCheckResult(updatedResult)
            // Use silent error handling for test errors
            handleSilentError(event, 'тест синтеза речи')
          }
          window.speechSynthesis.speak(testUtterance)
        } catch (e) {
          result += '❌ Ошибка теста синтеза: ' + (e instanceof Error ? e.message : String(e)) + '\n'
        }
      } else {
        result += '❌ Speech Synthesis не поддерживается\n'
      }
    } catch (e) {
      result += '❌ Ошибка диагностики синтеза речи: ' + (e instanceof Error ? e.message : String(e)) + '\n'
    }
    
    setMicCheckResult(result)
  }

  const { openTab } = useTabManager()

  // Автоматически открывать вкладку с историей чата при старте
  useEffect(() => {
    openTab({
      id: 'chat-history',
      title: 'Чат',
      content: <ChatHistoryModule messages={conversationHistory as ChatMessage[]} />,
      icon: <span>💬</span>,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { registerModule } = useModuleRegistry()
  useEffect(() => {
    registerModule({
      id: 'chat-history',
      name: 'Chat History',
      description: 'История чата пользователя',
      icon: <Sparkles className="text-cyan-400 w-4 h-4" />,
      version: '1.0.0',
      entry: <ChatHistoryModule messages={conversationHistory as ChatMessage[]} />,
      category: 'core',
      enabled: true,
    })
    registerModule({
      id: 'semantic-layer',
      name: 'Semantic Layer',
      description: 'Онтологический слой: triples, natural language → query',
      icon: <Sparkles className="text-yellow-400 w-4 h-4" />,
      version: '1.0.0',
      entry: <SemanticModule />,
      category: 'ai',
      enabled: true,
    })
    registerModule({
      id: 'no-code-builder',
      name: 'No-Code Builder',
      description: 'Создание lego-модулей без программирования',
      icon: <Code className="text-green-400 w-4 h-4" />,
      version: '1.0.0',
      entry: <NoCodeBuilderPanel />,
      category: 'tools',
      enabled: true,
    })
    registerModule({
      id: 'semantic-ai',
      name: 'Semantic AI',
      description: 'AI для автоматического создания модулей',
      icon: <Brain className="text-purple-400 w-4 h-4" />,
      version: '1.0.0',
      entry: <SemanticAIPanel />,
      category: 'ai',
      enabled: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Silent error handler for non-critical errors
  const handleSilentError = (error: any, context: string) => {
    // Don't log empty error objects to avoid console spam
    if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      console.log(`Silent empty error object in ${context} - ignoring`)
      return
    }
    console.log(`Silent error in ${context}:`, error)
    // Don't show to user, just log for debugging
  }

  // Enhanced error handler that decides whether to show errors to user
  const handleVoiceError = (error: any, context: string, showToUser: boolean = true) => {
    // Don't log empty error objects to avoid console spam
    if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      console.log(`Silent empty error object in ${context} - ignoring`)
      return
    }
    
    console.error(`Error in ${context}:`, error)
    
    if (showToUser) {
      let errorMessage = `Ошибка в ${context}`
      
      if (error && typeof error === 'object') {
        if (error.error) {
          errorMessage = `Ошибка ${context}: ${error.error}`
        } else if (error.message) {
          errorMessage = `Ошибка ${context}: ${error.message}`
        } else {
          errorMessage = `Неизвестная ошибка в ${context}`
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      setVoiceError(errorMessage)
    }
  }

  // Auto-recovery function for voice features
  const attemptVoiceRecovery = (context: string) => {
    console.log(`Attempting voice recovery for: ${context}`)
    
    // Clear any existing errors
    setVoiceError(null)
    
    // Restart wake word recognition if it's not running
    if (context.includes('wake') && !isWakeWordRunningRef.current && !isMainRecognitionRunningRef.current) {
      setTimeout(() => {
        console.log('Auto-restarting wake word recognition...')
        startWakeWordRecognition()
      }, 2000)
    }
    
    // Restart main recognition if it was interrupted
    if (context.includes('main') && !isMainRecognitionRunningRef.current && isListening) {
      setTimeout(() => {
        console.log('Auto-restarting main recognition...')
        startMainRecognition()
      }, 1000)
    }
  }

  // Check if speech synthesis is available and working
  const checkSpeechSynthesis = () => {
    try {
      if (!synthRef.current) {
        console.log('Speech synthesis not available')
        return false
      }
      
      // Check if synthesis is paused (common issue in some browsers)
      if (synthRef.current.paused) {
        console.log('Speech synthesis is paused, resuming...')
        synthRef.current.resume()
      }
      
      return true
    } catch (e) {
      console.log('Speech synthesis check failed:', e)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        {isEvolvingMode && (
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-ping"></div>
        )}
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className={`w-8 h-8 ${isEvolvingMode ? "text-green-400 animate-pulse" : "text-cyan-400"}`} />
              <div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping ${
                  wakeWordActive ? "bg-green-400" : isListening ? "bg-blue-400" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                S.O.M.A.
              </h1>
              <p className="text-sm text-gray-400">Smart Omnipresent Mobile Assistant</p>
              <div className="flex items-center space-x-2 mt-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">Evolution Level: {selfEvolutionLevel.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-green-400 text-green-400">
              Self-Evolving
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              AI Creator
            </Badge>
            <Badge variant="outline" className="border-pink-400 text-pink-400">
              {detectedEmotion}
            </Badge>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {Object.entries(languages).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 bg-transparent">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main AI Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Core Visualization */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div
                    className={`w-32 h-32 rounded-full border-4 ${
                      isListening
                        ? "border-cyan-400 animate-pulse"
                        : isThinking
                          ? "border-yellow-400 animate-spin"
                          : isEvolvingMode
                            ? "border-green-400 animate-pulse"
                            : "border-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full ${
                        isListening || isThinking || isEvolvingMode ? "animate-spin" : ""
                      }`}
                    ></div>
                    <div className="relative z-10">
                      {isThinking ? (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Brain
                            className={`w-10 h-10 ${
                              isEvolvingMode
                                ? "text-green-400"
                                : isListening
                                  ? "text-cyan-400"
                                  : isSpeaking
                                    ? "text-green-400"
                                    : "text-gray-400"
                            }`}
                          />
                          <Sparkles
                            className={`w-6 h-6 ${isEvolvingMode ? "text-yellow-400 animate-pulse" : "text-gray-500"}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {(isListening || isSpeaking || isEvolvingMode) && (
                    <div
                      className={`absolute -inset-4 border-2 ${
                        isEvolvingMode
                          ? "border-green-400/30"
                          : isListening
                            ? "border-cyan-400/30"
                            : "border-green-400/30"
                      } rounded-full animate-ping`}
                    ></div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setIsEvolvingMode(!isEvolvingMode)}
                    size="lg"
                    className={`rounded-full w-16 h-16 ${
                      isEvolvingMode ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
                    } transition-all duration-300`}
                  >
                    {isEvolvingMode ? <Zap className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                  </Button>

                  <Button
                    onClick={() => {
                      const newAI: CreatedAI = {
                        id: `ai_${Date.now()}`,
                        name: `Assistant ${createdAIs.length + 1}`,
                        purpose: "General assistance",
                        status: "training",
                        capabilities: ["basic_tasks", "learning"],
                        createdAt: new Date().toISOString(),
                      }
                      setCreatedAIs((prev) => [...prev, newAI])
                      setAiResponse("Creating new AI assistant... Training in progress!")
                    }}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                  >
                    <Cpu className="w-6 h-6" />
                  </Button>

                  {/* Voice Activation Button */}
                  <Button
                    onClick={() => {
                      if (isListening) {
                        stopMainRecognition()
                      } else if (isWakeWordListening) {
                        stopWakeWordRecognition()
                        startMainRecognition()
                      } else {
                        startWakeWordRecognition()
                      }
                    }}
                    size="lg"
                    className={`rounded-full w-16 h-16 transition-all duration-300 ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700"
                        : isWakeWordListening
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                    disabled={!speechSupported}
                  >
                    {isListening ? (
                      <Mic className="w-6 h-6" />
                    ) : isWakeWordListening ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-2">{languages[currentLanguage as keyof typeof languages].greeting}</p>
                  {isEvolvingMode && (
                    <p className="text-green-400 text-sm animate-pulse">🧠 Self-Evolution Active...</p>
                  )}
                  
                  {/* Voice Status Indicators */}
                  <div className="flex items-center justify-center space-x-4 mt-3">
                    {isWakeWordListening && (
                      <div className="flex items-center space-x-2">
                        <Mic className="text-cyan-400 animate-pulse w-4 h-4" />
                        <span className="text-cyan-400 text-sm">Слушаю ключевое слово</span>
                      </div>
                    )}
                    {isListening && (
                      <div className="flex items-center space-x-2">
                        <Mic className="text-green-400 animate-pulse w-4 h-4" />
                        <span className="text-green-400 text-sm">Слушаю вас</span>
                      </div>
                    )}
                    {isSpeaking && (
                      <div className="flex items-center space-x-2">
                        <Volume2 className="text-blue-400 animate-bounce w-4 h-4" />
                        <span className="text-blue-400 text-sm">Говорю</span>
                      </div>
                    )}
                    {isThinking && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="text-yellow-400 animate-spin w-4 h-4" />
                        <span className="text-yellow-400 text-sm">Думаю</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Wake Word Display */}
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">
                      Скажите <span className="text-cyan-400 font-semibold">"СОМА"</span> для активации
                    </p>
                  </div>
                </div>

                {aiResponse && (
                  <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-lg p-4 border border-cyan-400/30 animate-fade-in max-w-full">
                    <div className="flex items-start space-x-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold text-sm">SOMA:</span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-cyan-100">{aiResponse}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Self-Evolution Panel */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Self-Evolution Engine
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Evolution Level</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${selfEvolutionLevel}%` }}
                      ></div>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">{selfEvolutionLevel.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Evolution Mode</p>
                  <p className={`font-semibold ${isEvolvingMode ? "text-green-400" : "text-gray-400"}`}>
                    {isEvolvingMode ? "Active" : "Standby"}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Active Modules</p>
                  <p className="text-cyan-400 font-semibold">
                    {aiModules.filter((m) => m.status === "active").length}/{aiModules.length}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Created AIs</p>
                  <p className="text-purple-400 font-semibold">{createdAIs.length}</p>
                </div>
              </div>
            </Card>

            {/* AI Modules Status */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                AI Modules
              </h3>
              <div className="space-y-3">
                {aiModules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          module.status === "active"
                            ? "bg-green-400"
                            : module.status === "learning"
                              ? "bg-yellow-400 animate-pulse"
                              : module.status === "updating"
                                ? "bg-blue-400 animate-pulse"
                                : "bg-gray-600"
                        }`}
                      ></div>
                      <div>
                        <p className="text-gray-200 font-medium">{module.name}</p>
                        <p className="text-gray-400 text-xs">{module.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          module.status === "active"
                            ? "default"
                            : module.status === "learning"
                              ? "secondary"
                              : module.status === "updating"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-xs"
                      >
                        {module.status}
                      </Badge>
                      <p className="text-gray-400 text-xs mt-1">v{module.version}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Proactive Suggestions */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                Smart Suggestions
              </h3>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-400/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/70"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-200">{suggestion.text}</span>
                      {suggestion.emotion && <Heart className="w-4 h-4 text-pink-400" />}
                    </div>
                    <Badge
                      variant={
                        suggestion.priority === "high"
                          ? "destructive"
                          : suggestion.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
            <TabManager />
          </div>

          {/* Sidebar: Lego Module Registry */}
          <div className="space-y-6">
            <ModuleRegistryPanel />
            <UsageLoggerPanel />
            <BehaviorLoggerPanel />
            <ContextEnginePanel />
            <LearningEnginePanel />
            <NoCodeBuilderPanel />
            <SemanticAIPanel />
            {/* System Status */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Evolution:</span>
                  <span className="text-green-400 font-semibold">{selfEvolutionLevel.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <Badge
                    variant="outline"
                    className={`${
                      isEvolvingMode ? "border-green-400 text-green-400" : "border-gray-400 text-gray-400"
                    }`}
                  >
                    {isEvolvingMode ? "Evolving" : "Standby"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-green-400">{contextData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-blue-400 font-mono">{contextData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather:</span>
                  <span className="text-yellow-400">{contextData.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Activity:</span>
                  <span className="text-purple-400">{contextData.activity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mood:</span>
                  <span className="text-cyan-400">{contextData.mood}</span>
                </div>
              </div>
            </Card>

            {/* Created AIs */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                Created AIs
              </h3>
              <div className="space-y-3">
                {createdAIs.map((ai) => (
                  <div key={ai.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200 font-medium text-sm">{ai.name}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          ai.status === "active"
                            ? "bg-green-400"
                            : ai.status === "training"
                              ? "bg-yellow-400 animate-pulse"
                              : "bg-gray-600"
                        }`}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{ai.purpose}</p>
                    <div className="flex flex-wrap gap-1">
                      {ai.capabilities.slice(0, 2).map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Improvement Logs */}
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Improvements
              </h3>
              <div className="space-y-2">
                {improvementLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-2 bg-gray-800/50 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant={
                          log.type === "feature_add"
                            ? "default"
                            : log.type === "optimization"
                              ? "secondary"
                              : log.type === "bug_fix"
                                ? "outline"
                                : "destructive"
                        }
                        className="text-xs"
                      >
                        {log.type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          log.impact === "high" ? "destructive" : log.impact === "medium" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {log.impact}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-xs">{log.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>

      <div className="flex items-center gap-2 mb-2">
        {isWakeWordListening && <Mic className="text-cyan-400 animate-pulse w-5 h-5" />}
        {isListening && <Mic className="text-green-400 animate-pulse w-5 h-5" />}
        {isThinking && <Loader2 className="text-yellow-400 animate-spin w-5 h-5" />}
        {isSpeaking && <Volume2 className="text-blue-400 animate-bounce w-5 h-5" />}
      </div>
      {!speechSupported && (
        <div className="p-3 bg-red-900/60 text-red-200 rounded-lg mt-2">
          <b>Голосовые функции не поддерживаются этим браузером.</b> Попробуйте Google Chrome или Microsoft Edge, и разрешите доступ к микрофону.
        </div>
      )}
      {voiceError && (
        <div className="p-3 bg-red-900/60 text-red-200 rounded-lg mt-2">
          <div className="flex items-center justify-between">
            <div>
              <b>Ошибка голоса:</b> {voiceError}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 border-red-400 text-red-200 hover:bg-red-800"
              onClick={() => {
                setVoiceError(null)
                attemptVoiceRecovery('voice error recovery')
              }}
            >
              Восстановить
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4">
        {conversationHistory.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-2 ${msg.role === "assistant" ? "bg-gray-800/60" : "bg-gray-900/40"} rounded-lg p-2 my-1 animate-fade-in`}>
            <span>{msg.role === "assistant" ? "🤖" : "🧑"}</span>
            <span className="flex-1">
              {msg.content}
              {msg.emotion && emotionIcons[msg.emotion as keyof typeof emotionIcons]}
            </span>
          </div>
        ))}
      </div>

      {pushSupported && (
        <div className="my-2">
          <Button onClick={sendTestNotification} disabled={pushPermission !== 'granted'}>
            {pushPermission === 'granted' ? 'Тест Push-уведомления' : 'Разрешите уведомления'}
          </Button>
        </div>
      )}

      <div className="flex gap-2 my-2">
        <Button onClick={checkMicrophone} className="flex-1">Проверить микрофон</Button>
        <Button 
          onClick={() => {
            stopWakeWordRecognition()
            stopMainRecognition()
            setTimeout(() => {
              startWakeWordRecognition()
            }, 500)
          }} 
          className="flex-1"
          disabled={!speechSupported}
        >
          Перезапустить голос
        </Button>
        <Button 
          onClick={() => {
            speakText("Тест синтеза речи. Если вы слышите это сообщение, синтез речи работает корректно.")
          }} 
          className="flex-1"
          disabled={!speechSupported}
        >
          Тест синтеза
        </Button>
      </div>
      {micCheckResult && (
        <pre className="p-3 bg-blue-900/60 text-blue-200 rounded-lg mt-2 whitespace-pre-wrap">{micCheckResult}</pre>
      )}
    </div>
  )
}
