"use client"

import React, { createContext, useContext, useRef, useCallback, ReactNode } from "react"

// Тип события
export interface NeuroEvent<T = any> {
  type: string
  payload?: T
  meta?: Record<string, any>
}

type NeuroEventHandler = (event: NeuroEvent) => void

type NeuroContextType = {
  publish: (event: NeuroEvent) => void
  subscribe: (type: string, handler: NeuroEventHandler) => void
  unsubscribe: (type: string, handler: NeuroEventHandler) => void
}

const NeuroContext = createContext<NeuroContextType | undefined>(undefined)

export const NeuroProvider = ({ children }: { children: ReactNode }) => {
  // Map: event type -> Set of handlers
  const handlers = useRef<Map<string, Set<NeuroEventHandler>>>(new Map())

  const publish = useCallback((event: NeuroEvent) => {
    const set = handlers.current.get(event.type)
    if (set) {
      set.forEach(fn => fn(event))
    }
  }, [])

  const subscribe = useCallback((type: string, handler: NeuroEventHandler) => {
    if (!handlers.current.has(type)) {
      handlers.current.set(type, new Set())
    }
    handlers.current.get(type)!.add(handler)
  }, [])

  const unsubscribe = useCallback((type: string, handler: NeuroEventHandler) => {
    handlers.current.get(type)?.delete(handler)
  }, [])

  return (
    <NeuroContext.Provider value={{ publish, subscribe, unsubscribe }}>
      {children}
    </NeuroContext.Provider>
  )
}

export const useNeuro = () => {
  const ctx = useContext(NeuroContext)
  if (!ctx) throw new Error("useNeuro must be used within NeuroProvider")
  return ctx
} 