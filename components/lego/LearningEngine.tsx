"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNeuro } from "./NeuroContext"
import { useContextEngine } from "./ContextEngine"
import { useModuleRegistry } from "./ModuleRegistry"
import { Brain, TrendingUp, Lightbulb, Zap, Activity } from "lucide-react"

export interface LearningPattern {
  id: string
  type: 'usage' | 'behavior' | 'context'
  pattern: string
  frequency: number
  confidence: number
  suggestions: string[]
  lastSeen: string
}

export interface LearningInsight {
  id: string
  type: 'optimization' | 'suggestion' | 'warning'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  priority: number
  actionable: boolean
  action?: string
}

interface LearningEngineContextType {
  patterns: LearningPattern[]
  insights: LearningInsight[]
  addPattern: (pattern: LearningPattern) => void
  addInsight: (insight: LearningInsight) => void
  analyzeLogs: () => void
  applyOptimization: (insightId: string) => void
}

const LearningEngineContext = createContext<LearningEngineContextType | undefined>(undefined)

export const LearningEngineProvider = ({ children }: { children: ReactNode }) => {
  const [patterns, setPatterns] = useState<LearningPattern[]>([])
  const [insights, setInsights] = useState<LearningInsight[]>([])
  const { subscribe, unsubscribe, publish } = useNeuro()
  const { setSemanticContext, setBehaviorContext } = useContextEngine()
  const { modules } = useModuleRegistry()

  const addPattern = (pattern: LearningPattern) => {
    setPatterns(prev => {
      const existing = prev.find(p => p.pattern === pattern.pattern)
      if (existing) {
        return prev.map(p => 
          p.id === existing.id 
            ? { ...p, frequency: p.frequency + 1, lastSeen: new Date().toISOString() }
            : p
        )
      }
      return [...prev, pattern]
    })
  }

  const addInsight = (insight: LearningInsight) => {
    setInsights(prev => {
      if (prev.find(i => i.title === insight.title)) return prev
      return [...prev, insight].sort((a, b) => b.priority - a.priority)
    })
  }

  const analyzeLogs = () => {
    // Анализ паттернов использования
    const usagePatterns = patterns.filter(p => p.type === 'usage')
    const behaviorPatterns = patterns.filter(p => p.type === 'behavior')
    
    // Генерация инсайтов на основе паттернов
    usagePatterns.forEach(pattern => {
      if (pattern.frequency > 5) {
        addInsight({
          id: `insight-${Date.now()}-${Math.random()}`,
          type: 'optimization',
          title: `High Usage Pattern: ${pattern.pattern}`,
          description: `This pattern occurs ${pattern.frequency} times. Consider optimizing for better user experience.`,
          impact: pattern.frequency > 10 ? 'high' : 'medium',
          priority: pattern.frequency,
          actionable: true,
          action: 'optimize-module'
        })
      }
    })

    // Анализ поведения пользователя
    behaviorPatterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        addInsight({
          id: `insight-${Date.now()}-${Math.random()}`,
          type: 'suggestion',
          title: `Behavior Pattern Detected: ${pattern.pattern}`,
          description: `User behavior suggests ${pattern.pattern}. Consider adapting the interface.`,
          impact: 'medium',
          priority: Math.floor(pattern.confidence * 10),
          actionable: true,
          action: 'adapt-context'
        })
      }
    })

    publish({ type: 'learning-analysis-complete', payload: { patterns: patterns.length, insights: insights.length } })
  }

  const applyOptimization = (insightId: string) => {
    const insight = insights.find(i => i.id === insightId)
    if (!insight) return

    switch (insight.action) {
      case 'optimize-module':
        // Автоматическая оптимизация модуля
        publish({ type: 'module-optimization', payload: { insight } })
        break
      case 'adapt-context':
        // Адаптация контекста на основе поведения
        setBehaviorContext({ 
          lastAction: 'learning-adaptation',
          learningApplied: insight.title 
        })
        break
      case 'suggest-feature':
        // Предложение новой функции
        publish({ type: 'feature-suggestion', payload: { insight } })
        break
    }

    // Удалить применённый инсайт
    setInsights(prev => prev.filter(i => i.id !== insightId))
  }

  // Подписка на события для анализа
  useEffect(() => {
    const handler = (event: any) => {
      if (event.type === 'module-interaction') {
        addPattern({
          id: `pattern-${Date.now()}`,
          type: 'usage',
          pattern: `${event.payload.module}-${event.payload.action}`,
          frequency: 1,
          confidence: 0.8,
          suggestions: [`Optimize ${event.payload.module} module`],
          lastSeen: new Date().toISOString()
        })
      }
      if (event.type === 'behavior-context-changed') {
        addPattern({
          id: `pattern-${Date.now()}`,
          type: 'behavior',
          pattern: `context-${event.payload.activeModule || 'general'}`,
          frequency: 1,
          confidence: 0.9,
          suggestions: ['Adapt interface for this context'],
          lastSeen: new Date().toISOString()
        })
      }
    }

    subscribe('module-interaction', handler)
    subscribe('behavior-context-changed', handler)
    
    return () => {
      unsubscribe('module-interaction', handler)
      unsubscribe('behavior-context-changed', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Автоматический анализ каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(analyzeLogs, 30000)
    return () => clearInterval(interval)
  }, [patterns, insights])

  return (
    <LearningEngineContext.Provider value={{ 
      patterns, insights, addPattern, addInsight, analyzeLogs, applyOptimization 
    }}>
      {children}
    </LearningEngineContext.Provider>
  )
}

export const useLearningEngine = () => {
  const ctx = useContext(LearningEngineContext)
  if (!ctx) throw new Error("useLearningEngine must be used within LearningEngineProvider")
  return ctx
}

export const LearningEnginePanel: React.FC = () => {
  const { patterns, insights, analyzeLogs, applyOptimization } = useLearningEngine()
  const [activeTab, setActiveTab] = useState<'patterns' | 'insights'>('insights')

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-purple-700 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Brain className="text-purple-400" /> 
          Learning Engine
        </h3>
        <button
          onClick={analyzeLogs}
          className="text-xs bg-purple-700 px-2 py-1 rounded hover:bg-purple-600"
        >
          Analyze Now
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-purple-900/30 p-2 rounded">
          <div className="text-purple-300">Patterns</div>
          <div className="text-lg font-bold">{patterns.length}</div>
        </div>
        <div className="bg-purple-900/30 p-2 rounded">
          <div className="text-purple-300">Insights</div>
          <div className="text-lg font-bold">{insights.length}</div>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab('insights')}
          className={`text-xs px-2 py-1 rounded ${
            activeTab === 'insights' 
              ? 'bg-purple-700 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`text-xs px-2 py-1 rounded ${
            activeTab === 'patterns' 
              ? 'bg-purple-700 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          Patterns
        </button>
      </div>

      {/* Контент табов */}
      {activeTab === 'insights' ? (
        <div className="space-y-2">
          {insights.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No insights yet. Run analysis to generate insights.
            </div>
          ) : (
            insights.map(insight => (
              <div key={insight.id} className="p-2 bg-gray-800/50 rounded border border-gray-600">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {insight.type === 'optimization' && <Zap className="w-3 h-3 text-yellow-400" />}
                    {insight.type === 'suggestion' && <Lightbulb className="w-3 h-3 text-blue-400" />}
                    {insight.type === 'warning' && <Activity className="w-3 h-3 text-red-400" />}
                    <span className="text-sm font-semibold">{insight.title}</span>
                  </div>
                  <span className={`text-xs px-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-700' :
                    insight.impact === 'medium' ? 'bg-yellow-700' : 'bg-green-700'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
                <div className="text-xs text-gray-300 mb-2">{insight.description}</div>
                {insight.actionable && (
                  <button
                    onClick={() => applyOptimization(insight.id)}
                    className="text-xs bg-purple-700 px-2 py-1 rounded hover:bg-purple-600"
                  >
                    Apply
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No patterns detected yet.
            </div>
          ) : (
            patterns.map(pattern => (
              <div key={pattern.id} className="p-2 bg-gray-800/50 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{pattern.pattern}</span>
                  <span className="text-xs text-gray-400">
                    {pattern.frequency}x
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  Confidence: {Math.round(pattern.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-400">
                  Last seen: {new Date(pattern.lastSeen).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
} 