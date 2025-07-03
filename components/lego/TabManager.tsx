
"use client"

import React, { useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTabManager } from "./TabManagerContext"
import { useContextEngine } from "./ContextEngine"
import { useModuleRegistry } from "./ModuleRegistry"
import { useNeuro } from "./NeuroContext"
import { X } from "lucide-react"

export const TabManager: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useTabManager()
  const { semanticContext, behaviorContext } = useContextEngine()
  const { modules } = useModuleRegistry()
  const { subscribe, unsubscribe } = useNeuro()

  // Автоматическое открытие вкладки по activeModule или focusEntity
  useEffect(() => {
    if (behaviorContext.activeModule) {
      const mod = modules.find(m => m.id === behaviorContext.activeModule)
      if (mod && !tabs.find(t => t.id === `mod-${mod.id}`)) {
        openTab({
          id: `mod-${mod.id}`,
          title: mod.name,
          content: mod.entry,
          icon: mod.icon,
        })
      }
      setActiveTab(`mod-${behaviorContext.activeModule}`)
    } else if (semanticContext.focusEntity) {
      // Открыть вкладку для focusEntity, если модуль с таким id есть
      const mod = modules.find(m => m.id === semanticContext.focusEntity)
      if (mod && !tabs.find(t => t.id === `mod-${mod.id}`)) {
        openTab({
          id: `mod-${mod.id}`,
          title: mod.name,
          content: mod.entry,
          icon: mod.icon,
        })
      }
      setActiveTab(`mod-${semanticContext.focusEntity}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behaviorContext.activeModule, semanticContext.focusEntity])

  // Подписка на события NeuroContext для context-based rendering
  useEffect(() => {
    const handler = (event: any) => {
      if (event.type === 'semantic-context-changed' && event.payload?.focusEntity) {
        const mod = modules.find(m => m.id === event.payload.focusEntity)
        if (mod && !tabs.find(t => t.id === `mod-${mod.id}`)) {
          openTab({
            id: `mod-${mod.id}`,
            title: mod.name,
            content: mod.entry,
            icon: mod.icon,
          })
        }
        setActiveTab(`mod-${event.payload.focusEntity}`)
      }
      if (event.type === 'behavior-context-changed' && event.payload?.activeModule) {
        const mod = modules.find(m => m.id === event.payload.activeModule)
        if (mod && !tabs.find(t => t.id === `mod-${mod.id}`)) {
          openTab({
            id: `mod-${mod.id}`,
            title: mod.name,
            content: mod.entry,
            icon: mod.icon,
          })
        }
        setActiveTab(`mod-${event.payload.activeModule}`)
      }
    }
    subscribe('semantic-context-changed', handler)
    subscribe('behavior-context-changed', handler)
    return () => {
      unsubscribe('semantic-context-changed', handler)
      unsubscribe('behavior-context-changed', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, tabs])

  if (tabs.length === 0) {
    return <div className="p-8 text-center text-gray-400">Нет открытых вкладок</div>
  }

  return (
    <Tabs value={activeTabId ?? undefined} onValueChange={setActiveTab} className="w-full">
      <TabsList className="overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <div key={tab.id} className="inline-flex items-center">
            <TabsTrigger value={tab.id} className="relative pr-6">
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.title}
              <div
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); closeTab(tab.id) } }}
                tabIndex={0}
                role="button"
                aria-label="Закрыть вкладку"
              >
                <X className="w-3 h-3" />
              </div>
            </TabsTrigger>
          </div>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="p-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
} 