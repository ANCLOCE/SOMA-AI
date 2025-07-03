"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useModuleRegistry } from "./ModuleRegistry"
import { useNeuro } from "./NeuroContext"
import { useContextEngine } from "./ContextEngine"
import { useNoCodeBuilder } from "./NoCodeBuilder"
import { 
  Brain, 
  Zap, 
  Code, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Play,
  Square,
  Settings,
  Download,
  Upload
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface AIProvider {
  id: string
  name: string
  type: 'groq' | 'openai' | 'local' | 'custom'
  apiKey?: string
  endpoint?: string
  enabled: boolean
  capabilities: string[]
}

export interface AIGenerationRequest {
  id: string
  prompt: string
  context: {
    semantic: any
    behavior: any
    userIntent: string
  }
  moduleType: 'ui' | 'logic' | 'data' | 'event' | 'composite'
  requirements: string[]
  status: 'pending' | 'generating' | 'completed' | 'failed'
  result?: any
  error?: string
  timestamp: string
}

interface SemanticAIContextType {
  providers: AIProvider[]
  activeProvider: AIProvider | null
  generationRequests: AIGenerationRequest[]
  isGenerating: boolean
  addProvider: (provider: AIProvider) => void
  removeProvider: (id: string) => void
  setActiveProvider: (id: string) => void
  generateModule: (request: Omit<AIGenerationRequest, 'id' | 'status' | 'timestamp'>) => Promise<void>
  analyzeContext: (context: any) => Promise<any>
  autoGenerateFromContext: () => Promise<void>
}

const SemanticAIContext = createContext<SemanticAIContextType | undefined>(undefined)

export const SemanticAIProvider = ({ children }: { children: ReactNode }) => {
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'groq-default',
      name: 'Groq (Default)',
      type: 'groq',
      enabled: true,
      capabilities: ['code-generation', 'context-analysis', 'module-creation']
    },
    {
      id: 'openai-default',
      name: 'OpenAI GPT-4',
      type: 'openai',
      enabled: false,
      capabilities: ['code-generation', 'context-analysis', 'module-creation']
    }
  ])
  const [activeProvider, setActiveProviderState] = useState<AIProvider | null>(null)
  const [generationRequests, setGenerationRequests] = useState<AIGenerationRequest[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { registerModule } = useModuleRegistry()
  const { publish } = useNeuro()
  const { semanticContext, behaviorContext } = useContextEngine()
  const { createModule } = useNoCodeBuilder()

  useEffect(() => {
    const defaultProvider = providers.find(p => p.enabled)
    if (defaultProvider) {
      setActiveProviderState(defaultProvider)
    }
  }, [providers])

  const addProvider = (provider: AIProvider) => {
    setProviders(prev => [...prev, provider])
    publish({ type: 'module-interaction', payload: { module: 'semantic-ai', action: 'provider-added', provider } })
  }

  const removeProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id))
    if (activeProvider?.id === id) {
      setActiveProviderState(providers.find(p => p.id !== id) || null)
    }
  }

  const setActiveProvider = (id: string) => {
    const provider = providers.find(p => p.id === id)
    if (provider) {
      setActiveProviderState(provider)
    }
  }

  const callGroqAPI = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      
      if (!response.ok) throw new Error('Groq API error')
      
      const data = await response.json()
      return data.response || data.content || 'No response from Groq'
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }

  const callOpenAIAPI = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      
      if (!response.ok) throw new Error('OpenAI API error')
      
      const data = await response.json()
      return data.response || data.content || 'No response from OpenAI'
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  const generateModule = async (request: Omit<AIGenerationRequest, 'id' | 'status' | 'timestamp'>) => {
    if (!activeProvider) {
      throw new Error('No active AI provider')
    }

    const generationRequest: AIGenerationRequest = {
      ...request,
      id: `gen-${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toISOString()
    }

    setGenerationRequests(prev => [...prev, generationRequest])
    setIsGenerating(true)

    try {
      // Обновляем статус на generating
      setGenerationRequests(prev => 
        prev.map(req => req.id === generationRequest.id ? { ...req, status: 'generating' } : req)
      )

      // Формируем промпт для AI
      const prompt = `
Создай lego-модуль для SOMA на основе следующих требований:

Контекст:
- Семантический: ${JSON.stringify(request.context.semantic)}
- Поведенческий: ${JSON.stringify(request.context.behavior)}
- Намерение пользователя: ${request.context.userIntent}

Тип модуля: ${request.moduleType}
Требования: ${request.requirements.join(', ')}

Создай модуль в формате JSON с полями:
- id: уникальный идентификатор
- name: название модуля
- description: описание
- components: массив компонентов
- events: массив событий
- version: версия

Компоненты должны включать:
- type: ui/logic/data/event
- name: название
- properties: свойства
- position: позиция

Ответ должен быть только в формате JSON без дополнительного текста.
      `

      let aiResponse: string
      
      switch (activeProvider.type) {
        case 'groq':
          aiResponse = await callGroqAPI(prompt)
          break
        case 'openai':
          aiResponse = await callOpenAIAPI(prompt)
          break
        default:
          throw new Error(`Unsupported provider type: ${activeProvider.type}`)
      }

      // Парсим ответ AI
      let generatedModule
      try {
        // Извлекаем JSON из ответа AI
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          generatedModule = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in AI response')
        }
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${parseError}`)
      }

      // Регистрируем созданный модуль
      if (generatedModule) {
        registerModule({
          id: generatedModule.id,
          name: generatedModule.name,
          description: generatedModule.description,
          version: generatedModule.version,
          category: 'ai-generated',
          enabled: true,
          entry: <AIGeneratedModuleRenderer module={generatedModule} />
        })

        // Создаем модуль в NoCodeBuilder
        createModule({
          id: generatedModule.id,
          name: generatedModule.name,
          description: generatedModule.description,
          components: generatedModule.components || [],
          events: generatedModule.events || [],
          version: generatedModule.version
        })
      }

      // Обновляем статус на completed
      setGenerationRequests(prev => 
        prev.map(req => req.id === generationRequest.id ? { 
          ...req, 
          status: 'completed', 
          result: generatedModule 
        } : req)
      )

      publish({ 
        type: 'module-interaction', 
        payload: { 
          module: 'semantic-ai', 
          action: 'module-generated', 
          generatedModule: generatedModule 
        } 
      })

    } catch (error) {
      console.error('Module generation error:', error)
      
      // Обновляем статус на failed
      setGenerationRequests(prev => 
        prev.map(req => req.id === generationRequest.id ? { 
          ...req, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : req)
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const analyzeContext = async (context: any): Promise<any> => {
    if (!activeProvider) {
      throw new Error('No active AI provider')
    }

    const prompt = `
Проанализируй контекст и предложи модули для создания:

Контекст: ${JSON.stringify(context)}

Предложи:
1. Какие модули нужны пользователю
2. Какой тип модулей (ui/logic/data/event)
3. Основные требования к модулям

Ответ в формате JSON:
{
  "suggestions": [
    {
      "type": "ui/logic/data/event",
      "name": "Название модуля",
      "description": "Описание",
      "requirements": ["требование1", "требование2"]
    }
  ]
}
    `

    try {
      let aiResponse: string
      
      switch (activeProvider.type) {
        case 'groq':
          aiResponse = await callGroqAPI(prompt)
          break
        case 'openai':
          aiResponse = await callOpenAIAPI(prompt)
          break
        default:
          throw new Error(`Unsupported provider type: ${activeProvider.type}`)
      }

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in AI response')
      }
    } catch (error) {
      console.error('Context analysis error:', error)
      throw error
    }
  }

  const autoGenerateFromContext = async () => {
    try {
      const context = { semantic: semanticContext, behavior: behaviorContext }
      const analysis = await analyzeContext(context)
      
      if (analysis.suggestions) {
        for (const suggestion of analysis.suggestions) {
          await generateModule({
            prompt: `Создай модуль: ${suggestion.name}`,
            context: {
              semantic: semanticContext,
              behavior: behaviorContext,
              userIntent: suggestion.description
            },
            moduleType: suggestion.type as any,
            requirements: suggestion.requirements
          })
        }
      }
    } catch (error) {
      console.error('Auto generation error:', error)
    }
  }

  return (
    <SemanticAIContext.Provider value={{
      providers,
      activeProvider,
      generationRequests,
      isGenerating,
      addProvider,
      removeProvider,
      setActiveProvider,
      generateModule,
      analyzeContext,
      autoGenerateFromContext
    }}>
      {children}
    </SemanticAIContext.Provider>
  )
}

export const useSemanticAI = () => {
  const ctx = useContext(SemanticAIContext)
  if (!ctx) throw new Error("useSemanticAI must be used within SemanticAIProvider")
  return ctx
}

// Компонент для рендеринга AI-сгенерированного модуля
const AIGeneratedModuleRenderer: React.FC<{ module: any }> = ({ module }) => {
  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-green-700">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-green-400" />
        <h3 className="text-lg font-bold text-green-400">AI-Generated Module</h3>
        <Badge variant="outline" className="text-xs border-green-500 text-green-400">
          AI Created
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-semibold">{module.name}</div>
        <div className="text-xs text-gray-400">{module.description}</div>
        <div className="text-xs text-gray-500">Version: {module.version}</div>
        {module.components && (
          <div className="mt-2">
            <div className="text-xs font-semibold text-gray-300">Components:</div>
            {module.components.map((comp: any, index: number) => (
              <div key={index} className="text-xs text-gray-400 ml-2">
                • {comp.name} ({comp.type})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const SemanticAIPanel: React.FC = () => {
  const {
    providers,
    activeProvider,
    generationRequests,
    isGenerating,
    addProvider,
    removeProvider,
    setActiveProvider,
    generateModule,
    autoGenerateFromContext
  } = useSemanticAI()
  const [newProvider, setNewProvider] = useState<Partial<AIProvider>>({})
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [moduleType, setModuleType] = useState<'ui' | 'logic' | 'data' | 'event' | 'composite'>('ui')

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.type) {
      addProvider({
        id: `provider-${Date.now()}`,
        name: newProvider.name,
        type: newProvider.type as any,
        enabled: true,
        capabilities: ['code-generation', 'context-analysis', 'module-creation'],
        ...newProvider
      })
      setNewProvider({})
    }
  }

  const handleGenerateModule = async () => {
    if (!generationPrompt.trim()) return

    await generateModule({
      prompt: generationPrompt,
      context: {
        semantic: {},
        behavior: {},
        userIntent: generationPrompt
      },
      moduleType,
      requirements: [generationPrompt]
    })
    
    setGenerationPrompt('')
  }

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-green-700 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Brain className="text-green-400" /> 
          Semantic AI
        </h3>
        <div className="flex gap-1">
          <button
            onClick={autoGenerateFromContext}
            disabled={isGenerating}
            className="text-xs bg-green-700 px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* AI Providers */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-green-300">AI Providers</h4>
        <div className="space-y-2">
          {providers.map(provider => (
            <div
              key={provider.id}
              className={`p-2 rounded border cursor-pointer ${
                activeProvider?.id === provider.id
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveProvider(provider.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span className="text-sm font-semibold">{provider.name}</span>
                  <span className="text-xs text-gray-400">({provider.type})</span>
                </div>
                <div className="flex items-center gap-1">
                  {provider.enabled && <CheckCircle className="w-3 h-3 text-green-400" />}
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      removeProvider(provider.id)
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeProvider(provider.id) } }}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1"
                    tabIndex={0}
                    role="button"
                    aria-label="Удалить провайдер"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Provider */}
        <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-600">
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-xs"
              placeholder="Provider name..."
              value={newProvider.name || ''}
              onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
            />
            <select
              className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
              value={newProvider.type || ''}
              onChange={(e) => setNewProvider(prev => ({ ...prev, type: e.target.value as any }))}
            >
              <option value="">Type</option>
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
              <option value="local">Local</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <button
            onClick={handleAddProvider}
            className="w-full bg-green-700 text-white rounded px-2 py-1 text-xs hover:bg-green-600"
          >
            Add Provider
          </button>
        </div>
      </div>

      {/* Module Generation */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-green-300">Generate Module</h4>
        <div className="space-y-2">
          <textarea
            className="w-full bg-gray-800 text-white rounded px-2 py-1 text-xs"
            placeholder="Describe the module you want to create..."
            value={generationPrompt}
            onChange={(e) => setGenerationPrompt(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <select
              className="bg-gray-800 text-white rounded px-2 py-1 text-xs"
              value={moduleType}
              onChange={(e) => setModuleType(e.target.value as any)}
            >
              <option value="ui">UI</option>
              <option value="logic">Logic</option>
              <option value="data">Data</option>
              <option value="event">Event</option>
              <option value="composite">Composite</option>
            </select>
            <button
              onClick={handleGenerateModule}
              disabled={isGenerating || !generationPrompt.trim()}
              className="flex-1 bg-green-700 text-white rounded px-2 py-1 text-xs hover:bg-green-600 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Code className="w-3 h-3" />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Generation Requests */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-green-300">Recent Generations</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {generationRequests.slice(-3).reverse().map(request => (
            <div
              key={request.id}
              className={`p-2 rounded border text-xs ${
                request.status === 'completed'
                  ? 'bg-green-900/20 border-green-600'
                  : request.status === 'failed'
                    ? 'bg-red-900/20 border-red-600'
                    : request.status === 'generating'
                      ? 'bg-yellow-900/20 border-yellow-600'
                      : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{request.prompt.substring(0, 30)}...</span>
                <span className={`px-1 rounded ${
                  request.status === 'completed' ? 'bg-green-600 text-white' :
                  request.status === 'failed' ? 'bg-red-600 text-white' :
                  request.status === 'generating' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {request.status}
                </span>
              </div>
              {request.error && (
                <div className="text-red-400">{request.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 