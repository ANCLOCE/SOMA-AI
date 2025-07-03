"use client"

import React, { useState, useEffect } from "react"
import { useOntoEngine } from "./OntoEngine"
import { useContextEngine } from "./ContextEngine"
import { useNeuro } from "./NeuroContext"
import { Sparkles } from "lucide-react"

export const SemanticModule: React.FC = () => {
  const { triples, addTriple, queryTriples, mapNaturalLanguage } = useOntoEngine()
  const { semanticContext, behaviorContext } = useContextEngine()
  const { publish } = useNeuro()
  const [triple, setTriple] = useState({ subject: '', predicate: '', object: '' })
  const [nlQuery, setNlQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [filteredTriples, setFilteredTriples] = useState<any[]>([])

  // Автоматическая фильтрация триплетов по контексту
  useEffect(() => {
    if (semanticContext.focusEntity) {
      const filtered = triples.filter(t => 
        t.subject.toLowerCase().includes(semanticContext.focusEntity!.toLowerCase()) ||
        t.object.toLowerCase().includes(semanticContext.focusEntity!.toLowerCase())
      )
      setFilteredTriples(filtered)
    } else if (semanticContext.currentTask) {
      const filtered = triples.filter(t => 
        t.predicate.toLowerCase().includes(semanticContext.currentTask!.toLowerCase())
      )
      setFilteredTriples(filtered)
    } else {
      setFilteredTriples(triples)
    }
  }, [triples, semanticContext.focusEntity, semanticContext.currentTask])

  // Автоматический поиск при изменении контекста
  useEffect(() => {
    if (semanticContext.userIntent) {
      const query = mapNaturalLanguage(semanticContext.userIntent)
      const searchResults = queryTriples(query)
      setResults(searchResults)
      setNlQuery(semanticContext.userIntent)
    }
  }, [semanticContext.userIntent, mapNaturalLanguage, queryTriples])

  // Подписка на события для динамического обновления
  useEffect(() => {
    const handler = (event: any) => {
      if (event.type === 'semantic-context-changed') {
        // Обновить отображение при изменении семантического контекста
        if (event.payload?.focusEntity) {
          const filtered = triples.filter(t => 
            t.subject.toLowerCase().includes(event.payload.focusEntity.toLowerCase()) ||
            t.object.toLowerCase().includes(event.payload.focusEntity.toLowerCase())
          )
          setFilteredTriples(filtered)
        }
      }
    }
    publish({ type: 'module-interaction', payload: { module: 'semantic', action: 'context-updated' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanticContext, behaviorContext])

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-cyan-700">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <Sparkles className="text-cyan-400" /> 
        Semantic Layer
        {semanticContext.focusEntity && (
          <span className="text-xs bg-cyan-800 px-2 py-1 rounded">Focus: {semanticContext.focusEntity}</span>
        )}
      </h3>
      
      {/* Контекстная информация */}
      {(semanticContext.focusEntity || semanticContext.currentTask) && (
        <div className="mb-3 p-2 bg-cyan-900/30 rounded border border-cyan-600">
          <div className="text-xs text-cyan-300">
            {semanticContext.focusEntity && <div>Focus Entity: <b>{semanticContext.focusEntity}</b></div>}
            {semanticContext.currentTask && <div>Current Task: <b>{semanticContext.currentTask}</b></div>}
            {semanticContext.userIntent && <div>User Intent: <b>{semanticContext.userIntent}</b></div>}
          </div>
        </div>
      )}

      <div className="mb-2 flex gap-2">
        <input 
          className="bg-gray-800 text-white rounded px-2 py-1" 
          placeholder="Subject" 
          value={triple.subject} 
          onChange={e => setTriple(t => ({ ...t, subject: e.target.value }))} 
        />
        <input 
          className="bg-gray-800 text-white rounded px-2 py-1" 
          placeholder="Predicate" 
          value={triple.predicate} 
          onChange={e => setTriple(t => ({ ...t, predicate: e.target.value }))} 
        />
        <input 
          className="bg-gray-800 text-white rounded px-2 py-1" 
          placeholder="Object" 
          value={triple.object} 
          onChange={e => setTriple(t => ({ ...t, object: e.target.value }))} 
        />
        <button 
          className="bg-cyan-700 text-white rounded px-3 py-1" 
          onClick={() => {
            addTriple(triple)
            publish({ type: 'semantic-triple-added', payload: triple })
            setTriple({ subject: '', predicate: '', object: '' })
          }}
        >
          Add
        </button>
      </div>
      
      <div className="mb-2 flex gap-2">
        <input 
          className="bg-gray-800 text-white rounded px-2 py-1 flex-1" 
          placeholder="Natural language query..." 
          value={nlQuery} 
          onChange={e => setNlQuery(e.target.value)} 
        />
        <button 
          className="bg-cyan-700 text-white rounded px-3 py-1" 
          onClick={() => {
            const q = mapNaturalLanguage(nlQuery)
            setResults(queryTriples(q))
          }}
        >
          Search
        </button>
      </div>
      
      <div className="mb-2 text-xs text-gray-400">
        Triples: {filteredTriples.length} {filteredTriples.length !== triples.length && `(filtered from ${triples.length})`}
      </div>
      
      {/* Результаты поиска */}
      {results.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-cyan-300 mb-1">Search Results:</h4>
          <ul className="text-sm">
            {results.map((t, i) => (
              <li key={i} className="mb-1 p-1 bg-cyan-900/20 rounded">
                {t.subject} <b>{t.predicate}</b> {t.object}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Фильтрованные триплеты */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-1">
          {semanticContext.focusEntity ? 'Relevant Triples:' : 'All Triples:'}
        </h4>
        <ul className="text-sm max-h-40 overflow-y-auto">
          {filteredTriples.map((t, i) => (
            <li key={i} className="mb-1 p-1 bg-gray-800/50 rounded">
              {t.subject} <b>{t.predicate}</b> {t.object}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 