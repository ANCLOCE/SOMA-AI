"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export interface Triple {
  subject: string
  predicate: string
  object: string
}

interface OntoEngineContextType {
  triples: Triple[]
  addTriple: (triple: Triple) => void
  queryTriples: (query: Partial<Triple>) => Triple[]
  mapNaturalLanguage: (input: string) => Partial<Triple>
}

const OntoEngineContext = createContext<OntoEngineContextType | undefined>(undefined)

export const OntoEngineProvider = ({ children }: { children: ReactNode }) => {
  const [triples, setTriples] = useState<Triple[]>([])

  const addTriple = (triple: Triple) => {
    setTriples(prev => [...prev, triple])
  }

  const queryTriples = (query: Partial<Triple>) => {
    return triples.filter(t =>
      (!query.subject || t.subject.includes(query.subject)) &&
      (!query.predicate || t.predicate.includes(query.predicate)) &&
      (!query.object || t.object.includes(query.object))
    )
  }

  // Примитивный парсер natural language → triple (заглушка)
  const mapNaturalLanguage = (input: string): Partial<Triple> => {
    // Пример: "User likes AI" → { subject: 'User', predicate: 'likes', object: 'AI' }
    const match = input.match(/^(\w+)\s+(\w+)\s+(.+)$/)
    if (match) {
      return { subject: match[1], predicate: match[2], object: match[3] }
    }
    return { subject: input }
  }

  return (
    <OntoEngineContext.Provider value={{ triples, addTriple, queryTriples, mapNaturalLanguage }}>
      {children}
    </OntoEngineContext.Provider>
  )
}

export const useOntoEngine = () => {
  const ctx = useContext(OntoEngineContext)
  if (!ctx) throw new Error("useOntoEngine must be used within OntoEngineProvider")
  return ctx
} 