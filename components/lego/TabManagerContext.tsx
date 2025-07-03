"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useNeuro } from './NeuroContext'

export type TabType = {
  id: string
  title: string
  content: ReactNode
  icon?: ReactNode
}

interface TabManagerContextType {
  tabs: TabType[]
  activeTabId: string | null
  openTab: (tab: TabType) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

const TabManagerContext = createContext<TabManagerContextType | undefined>(undefined)

export const TabManagerProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<TabType[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const { subscribe, unsubscribe } = useNeuro()

  const openTab = (tab: TabType) => {
    setTabs((prev) => {
      if (prev.find((t) => t.id === tab.id)) return prev
      return [...prev, tab]
    })
    setActiveTabId(tab.id)
  }

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id))
    setTimeout(() => {
      setTabs((prev) => {
        if (prev.length === 0) {
          setActiveTabId(null)
        } else if (activeTabId === id) {
          setActiveTabId(prev[prev.length - 1].id)
        }
        return prev
      })
    }, 0)
  }

  const setActiveTab = (id: string) => {
    setActiveTabId(id)
  }

  // Подписка на событие 'open-tab' через NeuroContext
  useEffect(() => {
    const handler = (event: any) => {
      if (event.type === 'open-tab' && event.payload) {
        openTab(event.payload)
      }
    }
    subscribe('open-tab', handler)
    return () => unsubscribe('open-tab', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TabManagerContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTab }}>
      {children}
    </TabManagerContext.Provider>
  )
}

export const useTabManager = () => {
  const ctx = useContext(TabManagerContext)
  if (!ctx) throw new Error("useTabManager must be used within TabManagerProvider")
  return ctx
} 