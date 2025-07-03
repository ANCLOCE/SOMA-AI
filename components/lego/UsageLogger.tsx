"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNeuro } from "./NeuroContext"

export interface UsageLog {
  timestamp: string
  type: string
  payload?: any
}

interface UsageLoggerContextType {
  logs: UsageLog[]
  addLog: (log: UsageLog) => void
}

const UsageLoggerContext = createContext<UsageLoggerContextType | undefined>(undefined)

export const UsageLoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const { subscribe, unsubscribe } = useNeuro()

  const addLog = (log: UsageLog) => {
    setLogs(prev => [log, ...prev.slice(0, 199)]) // максимум 200 логов
  }

  useEffect(() => {
    const handler = (event: any) => {
      addLog({
        timestamp: new Date().toISOString(),
        type: event.type,
        payload: event.payload,
      })
    }
    subscribe('open-tab', handler)
    subscribe('semantic-triple-added', handler)
    // можно добавить другие события
    return () => {
      unsubscribe('open-tab', handler)
      unsubscribe('semantic-triple-added', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UsageLoggerContext.Provider value={{ logs, addLog }}>
      {children}
    </UsageLoggerContext.Provider>
  )
}

export const useUsageLogger = () => {
  const ctx = useContext(UsageLoggerContext)
  if (!ctx) throw new Error("useUsageLogger must be used within UsageLoggerProvider")
  return ctx
}

export const UsageLoggerPanel: React.FC = () => {
  const { logs } = useUsageLogger()
  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-yellow-700 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2 text-yellow-400">Usage Logs</h3>
      <ul className="text-xs">
        {logs.map((log, i) => (
          <li key={i} className="mb-1">
            <span className="text-yellow-300">[{log.timestamp.slice(11,19)}]</span> <b>{log.type}</b> {log.payload && typeof log.payload === 'object' ? JSON.stringify(log.payload) : String(log.payload)}
          </li>
        ))}
      </ul>
    </div>
  )
} 