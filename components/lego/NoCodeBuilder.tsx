"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useModuleRegistry } from "./ModuleRegistry"
import { useNeuro } from "./NeuroContext"
import { useContextEngine } from "./ContextEngine"
import { 
  Palette, 
  Settings, 
  Code, 
  Zap, 
  Eye, 
  Save, 
  Play, 
  Square,
  Plus,
  Trash2,
  Copy,
  Move
} from "lucide-react"

export interface NoCodeComponent {
  id: string
  type: 'ui' | 'logic' | 'data' | 'event'
  name: string
  icon: ReactNode
  properties: Record<string, any>
  children?: NoCodeComponent[]
  position: { x: number; y: number }
}

export interface NoCodeModule {
  id: string
  name: string
  description: string
  components: NoCodeComponent[]
  events: string[]
  version: string
}

interface NoCodeBuilderContextType {
  currentModule: NoCodeModule | null
  components: NoCodeComponent[]
  selectedComponent: string | null
  createModule: (module: NoCodeModule) => void
  addComponent: (component: NoCodeComponent) => void
  updateComponent: (id: string, updates: Partial<NoCodeComponent>) => void
  removeComponent: (id: string) => void
  selectComponent: (id: string | null) => void
  exportModule: () => void
}

const NoCodeBuilderContext = createContext<NoCodeBuilderContextType | undefined>(undefined)

export const NoCodeBuilderProvider = ({ children }: { children: ReactNode }) => {
  const [currentModule, setCurrentModule] = useState<NoCodeModule | null>(null)
  const [components, setComponents] = useState<NoCodeComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const { registerModule } = useModuleRegistry()
  const { publish } = useNeuro()

  const createModule = (module: NoCodeModule) => {
    setCurrentModule(module)
    setComponents(module.components)
  }

  const addComponent = (component: NoCodeComponent) => {
    setComponents(prev => [...prev, component])
    publish({ type: 'module-interaction', payload: { module: 'no-code-builder', action: 'component-added', component } })
  }

  const updateComponent = (id: string, updates: Partial<NoCodeComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ))
  }

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
    if (selectedComponent === id) setSelectedComponent(null)
  }

  const selectComponent = (id: string | null) => {
    setSelectedComponent(id)
  }

  const exportModule = () => {
    if (!currentModule) return

    const exportedModule = {
      ...currentModule,
      components,
      entry: <NoCodeModuleRenderer components={components} />
    }

    registerModule(exportedModule)
    publish({ type: 'module-interaction', payload: { module: 'no-code-builder', action: 'module-exported', exportedModule } })
  }

  return (
    <NoCodeBuilderContext.Provider value={{
      currentModule,
      components,
      selectedComponent,
      createModule,
      addComponent,
      updateComponent,
      removeComponent,
      selectComponent,
      exportModule
    }}>
      {children}
    </NoCodeBuilderContext.Provider>
  )
}

export const useNoCodeBuilder = () => {
  const ctx = useContext(NoCodeBuilderContext)
  if (!ctx) throw new Error("useNoCodeBuilder must be used within NoCodeBuilderProvider")
  return ctx
}

// Компонент для рендеринга созданного модуля
const NoCodeModuleRenderer: React.FC<{ components: NoCodeComponent[] }> = ({ components }) => {
  const { semanticContext, behaviorContext } = useContextEngine()

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-green-700">
      <h3 className="text-lg font-bold mb-2 text-green-400">No-Code Module</h3>
      <div className="space-y-2">
        {components.map(component => (
          <div key={component.id} className="p-2 bg-gray-800/50 rounded border border-gray-600">
            <div className="flex items-center gap-2">
              {component.icon}
              <span className="font-semibold">{component.name}</span>
              <span className="text-xs text-gray-400">({component.type})</span>
            </div>
            {Object.entries(component.properties).map(([key, value]) => (
              <div key={key} className="text-xs text-gray-300">
                {key}: {String(value)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Готовые компоненты для drag&drop
const AVAILABLE_COMPONENTS: Omit<NoCodeComponent, 'id' | 'position'>[] = [
  {
    type: 'ui',
    name: 'Text Display',
    icon: <Eye className="w-4 h-4" />,
    properties: { text: 'Sample text', color: 'white', size: 'medium' }
  },
  {
    type: 'ui',
    name: 'Button',
    icon: <Zap className="w-4 h-4" />,
    properties: { label: 'Click me', action: 'none', color: 'blue' }
  },
  {
    type: 'ui',
    name: 'Input Field',
    icon: <Code className="w-4 h-4" />,
    properties: { placeholder: 'Enter text...', type: 'text', required: false }
  },
  {
    type: 'logic',
    name: 'Condition',
    icon: <Settings className="w-4 h-4" />,
    properties: { condition: 'if', value: 'true', action: 'show' }
  },
  {
    type: 'data',
    name: 'Data Source',
    icon: <Palette className="w-4 h-4" />,
    properties: { source: 'context', field: 'focusEntity', format: 'string' }
  },
  {
    type: 'event',
    name: 'Event Trigger',
    icon: <Zap className="w-4 h-4" />,
    properties: { event: 'click', target: 'button', action: 'publish' }
  }
]

export const NoCodeBuilderPanel: React.FC = () => {
  const { 
    currentModule, 
    components, 
    selectedComponent, 
    createModule, 
    addComponent, 
    updateComponent, 
    removeComponent, 
    selectComponent, 
    exportModule 
  } = useNoCodeBuilder()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [moduleName, setModuleName] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')

  const handleCreateNewModule = () => {
    const newModule: NoCodeModule = {
      id: `nocode-${Date.now()}`,
      name: moduleName || 'New Module',
      description: moduleDescription || 'Created with No-Code Builder',
      components: [],
      events: [],
      version: '1.0.0'
    }
    createModule(newModule)
  }

  const handleDragStart = (e: React.DragEvent, component: Omit<NoCodeComponent, 'id' | 'position'>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const componentData = JSON.parse(e.dataTransfer.getData('application/json'))
    const newComponent: NoCodeComponent = {
      ...componentData,
      id: `comp-${Date.now()}-${Math.random()}`,
      position: { x: e.clientX, y: e.clientY }
    }
    addComponent(newComponent)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="p-4 bg-gray-900/80 rounded-lg border border-green-700 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Code className="text-green-400" /> 
          No-Code Builder
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`text-xs px-2 py-1 rounded ${
              isPreviewMode ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {isPreviewMode ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={exportModule}
            className="text-xs bg-green-700 px-2 py-1 rounded hover:bg-green-600"
          >
            <Save className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!currentModule ? (
        <div className="space-y-3">
          <div>
            <input
              className="w-full bg-gray-800 text-white rounded px-2 py-1 text-sm mb-2"
              placeholder="Module name..."
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
            <textarea
              className="w-full bg-gray-800 text-white rounded px-2 py-1 text-sm"
              placeholder="Module description..."
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              rows={2}
            />
          </div>
          <button
            onClick={handleCreateNewModule}
            className="w-full bg-green-700 text-white rounded px-3 py-2 hover:bg-green-600"
          >
            Create New Module
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Информация о модуле */}
          <div className="p-2 bg-gray-800/50 rounded">
            <div className="text-sm font-semibold">{currentModule.name}</div>
            <div className="text-xs text-gray-400">{currentModule.description}</div>
            <div className="text-xs text-gray-500">Components: {components.length}</div>
          </div>

          {/* Доступные компоненты */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-green-300">Components</h4>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_COMPONENTS.map((component, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component)}
                  className="p-2 bg-gray-800/50 rounded border border-gray-600 cursor-move hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-1 text-xs">
                    {component.icon}
                    <span>{component.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Рабочая область */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-green-300">Canvas</h4>
            <div
              className="min-h-32 bg-gray-800/30 rounded border-2 border-dashed border-gray-600 p-2"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isPreviewMode ? (
                <NoCodeModuleRenderer components={components} />
              ) : (
                <div className="space-y-2">
                  {components.map(component => (
                    <div
                      key={component.id}
                      onClick={() => selectComponent(component.id)}
                      className={`p-2 rounded border cursor-pointer ${
                        selectedComponent === component.id
                          ? 'bg-green-900/30 border-green-500'
                          : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {component.icon}
                          <span className="text-sm font-semibold">{component.name}</span>
                          <span className="text-xs text-gray-400">({component.type})</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            removeComponent(component.id)
                          }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeComponent(component.id) } }}
                          className="text-red-400 hover:text-red-300 cursor-pointer p-1"
                          tabIndex={0}
                          role="button"
                          aria-label="Удалить компонент"
                        >
                          <Trash2 className="w-3 h-3" />
                        </div>
                      </div>
                      {Object.entries(component.properties).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-300 ml-6">
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  ))}
                  {components.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Drag components here to build your module
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Свойства выбранного компонента */}
          {selectedComponent && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-300">Properties</h4>
              <div className="p-2 bg-gray-800/50 rounded">
                {(() => {
                  const component = components.find(c => c.id === selectedComponent)
                  if (!component) return null
                  
                  return Object.entries(component.properties).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <label className="text-xs text-gray-300">{key}:</label>
                      <input
                        className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs"
                        value={String(value)}
                        onChange={(e) => updateComponent(component.id, {
                          properties: { ...component.properties, [key]: e.target.value }
                        })}
                      />
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 