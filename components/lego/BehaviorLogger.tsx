"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNeuro } from "./NeuroContext"

export interface BehaviorLog {
  timestamp: string
  action: string
  details?: any
}

interface BehaviorLoggerContextType {
  logs: BehaviorLog[]
  addLog: (log: BehaviorLog) => void
}

const BehaviorLoggerContext = createContext<BehaviorLoggerContextType | undefined>(undefined)

export const BehaviorLoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<BehaviorLog[]>([])
  const { subscribe, unsubscribe } = useNeuro()

  const addLog = (log: BehaviorLog) => {
    setLogs(prev => [log, ...prev.slice(0, 199)]) // максимум 200 логов
  }

  useEffect(() => {
    const handler = (event: any) => {
      addLog({
        timestamp: new Date().toISOString(),
        action: event.type,
        details: event.payload,
      })
    }
    subscribe('tab-activated', handler)
    subscribe('module-interaction', handler)
    subscribe('semantic-context-changed', handler)
    // можно добавить другие события
    return () => {
      unsubscribe('tab-activated', handler)
      unsubscribe('module-interaction', handler)
      unsubscribe('semantic-context-changed', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BehaviorLoggerContext.Provider value={{ logs, addLog }}>
      {children}
    </BehaviorLoggerContext.Provider>
  )
}

export const useBehaviorLogger = () => {
  const ctx = useContext(BehaviorLoggerContext)
  if (!ctx) throw new Error("useBehaviorLogger must be used within BehaviorLoggerProvider")
  return ctx
}

export const BehaviorLoggerPanel: React.FC = () => {
  const { logs } = useBehaviorLogger()
  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-cyan-700 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2 text-cyan-400">Behavior Logs</h3>
      <ul className="text-xs">
        {logs.map((log, i) => (
          <li key={i} className="mb-1">
            <span className="text-cyan-300">[{log.timestamp.slice(11,19)}]</span> <b>{log.action}</b> {log.details && typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
          </li>
        ))}
      </ul>
    </div>
  )
} 