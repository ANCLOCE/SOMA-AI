"use client"

import React, { useState, useEffect } from "react"
import { useContextEngine } from "./ContextEngine"
import { useNeuro } from "./NeuroContext"
import { MessageCircle, Filter, Search } from "lucide-react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  emotion?: string
  context?: string
}

interface ChatHistoryModuleProps {
  messages: ChatMessage[]
}

export const ChatHistoryModule: React.FC<ChatHistoryModuleProps> = ({ messages }) => {
  const { semanticContext, behaviorContext } = useContextEngine()
  const { publish } = useNeuro()
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>(messages)
  const [searchTerm, setSearchTerm] = useState("")
  const [emotionFilter, setEmotionFilter] = useState<string>("all")
  const [showContextInfo, setShowContextInfo] = useState(false)

  // Фильтрация сообщений по контексту
  useEffect(() => {
    let filtered = messages

    // Фильтр по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Фильтр по эмоции
    if (emotionFilter !== "all") {
      filtered = filtered.filter(msg => msg.emotion === emotionFilter)
    }

    // Фильтр по focusEntity
    if (semanticContext.focusEntity) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(semanticContext.focusEntity!.toLowerCase()) ||
        msg.context?.toLowerCase().includes(semanticContext.focusEntity!.toLowerCase())
      )
    }

    // Фильтр по currentTask
    if (semanticContext.currentTask) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(semanticContext.currentTask!.toLowerCase()) ||
        msg.context?.toLowerCase().includes(semanticContext.currentTask!.toLowerCase())
      )
    }

    setFilteredMessages(filtered)
  }, [messages, searchTerm, emotionFilter, semanticContext.focusEntity, semanticContext.currentTask])

  // Автоматическое обновление при новых сообщениях
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      publish({ 
        type: 'module-interaction', 
        payload: { 
          module: 'chat-history', 
          action: 'new-message',
          message: lastMessage
        } 
      })
    }
  }, [messages, publish])

  // Получить уникальные эмоции из сообщений
  const emotions = Array.from(new Set(messages.map(m => m.emotion).filter(Boolean)))

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-blue-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="text-blue-400" /> 
          Chat History
          {semanticContext.focusEntity && (
            <span className="text-xs bg-blue-800 px-2 py-1 rounded">Focus: {semanticContext.focusEntity}</span>
          )}
        </h3>
        <button
          onClick={() => setShowContextInfo(!showContextInfo)}
          className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          {showContextInfo ? 'Hide' : 'Show'} Context
        </button>
      </div>

      {/* Контекстная информация */}
      {showContextInfo && (semanticContext.focusEntity || semanticContext.currentTask) && (
        <div className="mb-3 p-2 bg-blue-900/30 rounded border border-blue-600">
          <div className="text-xs text-blue-300">
            {semanticContext.focusEntity && <div>Focus Entity: <b>{semanticContext.focusEntity}</b></div>}
            {semanticContext.currentTask && <div>Current Task: <b>{semanticContext.currentTask}</b></div>}
            {semanticContext.userIntent && <div>User Intent: <b>{semanticContext.userIntent}</b></div>}
            <div>Active Module: <b>{behaviorContext.activeModule || 'None'}</b></div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            className="bg-gray-800 text-white rounded px-2 py-1 text-sm"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="bg-gray-800 text-white rounded px-2 py-1 text-sm"
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
          >
            <option value="all">All emotions</option>
            {emotions.map(emotion => (
              <option key={emotion} value={emotion}>{emotion}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Статистика */}
      <div className="text-xs text-gray-400 mb-2">
        Showing {filteredMessages.length} of {messages.length} messages
        {filteredMessages.length !== messages.length && (
          <span className="text-blue-400"> (filtered)</span>
        )}
      </div>

      {/* Список сообщений */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages match the current filters
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-900/30 border border-blue-600"
                  : "bg-gray-800/50 border border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {message.role === "user" ? "🧑 User" : "🤖 Assistant"}
                  </span>
                  {message.emotion && (
                    <span className="text-xs bg-gray-700 px-1 rounded">
                      {message.emotion}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-sm">{message.content}</div>
              {message.context && (
                <div className="mt-1 text-xs text-gray-400">
                  Context: {message.context}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Быстрые действия */}
      <div className="mt-3 flex gap-2">
        <button
          className="text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-600"
          onClick={() => {
            publish({ 
              type: 'module-interaction', 
              payload: { 
                module: 'chat-history', 
                action: 'export-history',
                count: filteredMessages.length
              } 
            })
          }}
        >
          Export Filtered
        </button>
        <button
          className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          onClick={() => {
            setSearchTerm("")
            setEmotionFilter("all")
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
} 