"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNeuro } from "./NeuroContext"

export interface SemanticContext {
  focusEntity?: string
  currentTask?: string
  userIntent?: string
  [key: string]: any
}

export interface BehaviorContext {
  activeTab?: string
  activeModule?: string
  lastAction?: string
  [key: string]: any
}

interface ContextEngineType {
  semanticContext: SemanticContext
  behaviorContext: BehaviorContext
  setSemanticContext: (ctx: Partial<SemanticContext>) => void
  setBehaviorContext: (ctx: Partial<BehaviorContext>) => void
}

const ContextEngineContext = createContext<ContextEngineType | undefined>(undefined)

export const ContextEngineProvider = ({ children }: { children: ReactNode }) => {
  const [semanticContext, setSemanticContextState] = useState<SemanticContext>({})
  const [behaviorContext, setBehaviorContextState] = useState<BehaviorContext>({})
  const { publish } = useNeuro()

  const setSemanticContext = (ctx: Partial<SemanticContext>) => {
    setSemanticContextState(prev => {
      const updated = { ...prev, ...ctx }
      publish({ type: 'semantic-context-changed', payload: { ...updated } })
      return updated
    })
  }

  const setBehaviorContext = (ctx: Partial<BehaviorContext>) => {
    setBehaviorContextState(prev => {
      const updated = { ...prev, ...ctx }
      publish({ type: 'behavior-context-changed', payload: { ...updated } })
      return updated
    })
  }

  return (
    <ContextEngineContext.Provider value={{ semanticContext, behaviorContext, setSemanticContext, setBehaviorContext }}>
      {children}
    </ContextEngineContext.Provider>
  )
}

export const useContextEngine = () => {
  const ctx = useContext(ContextEngineContext)
  if (!ctx) throw new Error("useContextEngine must be used within ContextEngineProvider")
  return ctx
}

export const ContextEnginePanel: React.FC = () => {
  const { semanticContext, behaviorContext, setSemanticContext, setBehaviorContext } = useContextEngine()
  const [semDraft, setSemDraft] = useState(semanticContext)
  const [behDraft, setBehDraft] = useState(behaviorContext)

  useEffect(() => { setSemDraft(semanticContext) }, [semanticContext])
  useEffect(() => { setBehDraft(behaviorContext) }, [behaviorContext])

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-indigo-700 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2 text-indigo-400">Context Engine</h3>
      <div className="mb-2">
        <b className="text-indigo-300">Semantic Context</b>
        <pre className="bg-gray-800 rounded p-2 text-xs text-indigo-200 mb-2">{JSON.stringify(semanticContext, null, 2)}</pre>
        <textarea
          className="w-full bg-gray-800 text-indigo-200 rounded p-1 text-xs mb-1"
          rows={3}
          value={JSON.stringify(semDraft, null, 2)}
          onChange={e => setSemDraft(JSON.parse(e.target.value || '{}'))}
        />
        <button className="bg-indigo-700 text-white rounded px-2 py-1 text-xs" onClick={() => setSemanticContext(semDraft)}>Update Semantic</button>
      </div>
      <div>
        <b className="text-indigo-300">Behavior Context</b>
        <pre className="bg-gray-800 rounded p-2 text-xs text-cyan-200 mb-2">{JSON.stringify(behaviorContext, null, 2)}</pre>
        <textarea
          className="w-full bg-gray-800 text-cyan-200 rounded p-1 text-xs mb-1"
          rows={3}
          value={JSON.stringify(behDraft, null, 2)}
          onChange={e => setBehDraft(JSON.parse(e.target.value || '{}'))}
        />
        <button className="bg-cyan-700 text-white rounded px-2 py-1 text-xs" onClick={() => setBehaviorContext(behDraft)}>Update Behavior</button>
      </div>
    </div>
  )
} 