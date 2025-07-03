"use client"

import React, { createContext, useContext, useState, ReactNode, useRef } from "react"
// @ts-ignore
import yaml from 'js-yaml'
import { useTabManager } from './TabManagerContext'
// @ts-ignore
import { DndProvider, useDrag, useDrop } from 'react-dnd'
// @ts-ignore
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useNeuro } from './NeuroContext'

// Тип манифеста lego-модуля
export interface ModuleManifest {
  id: string
  name: string
  description?: string
  icon?: ReactNode
  category?: string
  version?: string
  entry?: ReactNode // UI-компонент или функция для динамического подключения
  tags?: string[]
  enabled?: boolean
}

interface ModuleRegistryContextType {
  modules: ModuleManifest[]
  registerModule: (manifest: ModuleManifest) => void
  unregisterModule: (id: string) => void
}

const ModuleRegistryContext = createContext<ModuleRegistryContextType | undefined>(undefined)

export const ModuleRegistryProvider = ({ children }: { children: ReactNode }) => {
  const [modules, setModules] = useState<ModuleManifest[]>([])

  const registerModule = (manifest: ModuleManifest) => {
    setModules((prev) => {
      if (prev.find((m) => m.id === manifest.id)) return prev
      return [...prev, manifest]
    })
  }

  const unregisterModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <ModuleRegistryContext.Provider value={{ modules, registerModule, unregisterModule }}>
      {children}
    </ModuleRegistryContext.Provider>
  )
}

export const useModuleRegistry = () => {
  const ctx = useContext(ModuleRegistryContext)
  if (!ctx) throw new Error("useModuleRegistry must be used within ModuleRegistryProvider")
  return ctx
}

const DND_TYPE = 'MODULE_ITEM'

function DraggableModuleItem({ mod, index, moveModule, onClick }: { mod: ModuleManifest, index: number, moveModule: (from: number, to: number) => void, onClick: () => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const [, drop] = useDrop({
    accept: DND_TYPE,
    hover(item: { index: number }, monitor: any) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      moveModule(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPE,
    item: { index },
    collect: (monitor: any) => ({ isDragging: monitor.isDragging() }),
  })
  drag(drop(ref))
  return (
    <li
      ref={ref}
      className={`p-2 bg-gray-800/60 rounded flex items-center gap-2 cursor-pointer hover:bg-cyan-900/40 transition-opacity ${isDragging ? 'opacity-40' : ''}`}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {mod.icon && <span>{mod.icon}</span>}
      <span className="font-semibold">{mod.name}</span>
      <span className="text-xs text-gray-400">{mod.version}</span>
      <span className="ml-auto text-gray-500">{mod.description}</span>
    </li>
  )
}

export const ModuleRegistryPanel: React.FC = () => {
  const { modules, registerModule } = useModuleRegistry()
  const { openTab } = useTabManager()
  const { publish } = useNeuro()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [ordered, setOrdered] = useState<ModuleManifest[] | null>(null)

  // Собрать уникальные категории
  const categories = Array.from(new Set(modules.map(m => m.category).filter(Boolean))) as string[]

  // Фильтрация
  const filtered = (ordered ?? modules).filter(mod => {
    const matchCat = category === 'all' || mod.category === category
    const matchSearch =
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      (mod.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchCat && matchSearch
  })

  // Drag&Drop reorder
  const moveModule = (from: number, to: number) => {
    setOrdered(prev => {
      const arr = [...(prev ?? modules)]
      const [removed] = arr.splice(from, 1)
      arr.splice(to, 0, removed)
      return arr
    })
  }

  // Загрузка и парсинг манифестов
  const loadManifestsFromFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const text = await file.text()
      let manifest: any
      try {
        if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          manifest = yaml.load(text)
        } else {
          manifest = JSON.parse(text)
        }
        if (manifest && manifest.id && manifest.name) {
          registerModule(manifest)
        }
      } catch (e) {
        // Можно добавить обработку ошибок
        console.error('Ошибка парсинга манифеста', file.name, e)
      }
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700">
        <h2 className="text-lg font-bold mb-2">Lego Module Registry</h2>
        <div className="flex gap-2 mb-2">
          <select
            className="bg-gray-800 text-white rounded px-2 py-1"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            className="bg-gray-800 text-white rounded px-2 py-1 flex-1"
            placeholder="Поиск модуля..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,.yaml,.yml"
          multiple
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files) loadManifestsFromFiles(e.target.files)
          }}
        />
        <button
          className="mb-2 px-3 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-800"
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить манифесты (YAML/JSON)
        </button>
        <button
          className="mb-2 px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800"
          onClick={() => {
            publish({
              type: 'open-tab',
              payload: {
                id: 'test-event-tab',
                title: 'Вкладка через событие',
                content: <div className="p-4">Открыто через NeuroContext!</div>,
                icon: '🧠',
              },
            })
          }}
        >
          Открыть тестовую вкладку через событие
        </button>
        {filtered.length === 0 ? (
          <div className="text-gray-400">Нет подходящих модулей</div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((mod, i) => (
              <DraggableModuleItem
                key={mod.id}
                mod={mod}
                index={i}
                moveModule={moveModule}
                onClick={() => {
                  if (mod.entry) {
                    openTab({
                      id: `mod-${mod.id}`,
                      title: mod.name,
                      content: mod.entry,
                      icon: mod.icon,
                    })
                  }
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </DndProvider>
  )
} 