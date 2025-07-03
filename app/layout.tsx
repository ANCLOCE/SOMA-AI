import type { Metadata } from 'next'
import './globals.css'
import { TabManagerProvider } from '@/components/lego/TabManagerContext'
import { ModuleRegistryProvider } from '@/components/lego/ModuleRegistry'
import { NeuroProvider } from '@/components/lego/NeuroContext'
import { OntoEngineProvider } from '@/components/lego/OntoEngine'
import { UsageLoggerProvider } from '@/components/lego/UsageLogger'
import { BehaviorLoggerProvider } from '@/components/lego/BehaviorLogger'
import { ContextEngineProvider } from '@/components/lego/ContextEngine'
import { LearningEngineProvider } from '@/components/lego/LearningEngine'
import { NoCodeBuilderProvider } from '@/components/lego/NoCodeBuilder'
import { SemanticAIProvider } from '@/components/lego/SemanticAI'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <NeuroProvider>
          <ContextEngineProvider>
            <ModuleRegistryProvider>
              <LearningEngineProvider>
                <BehaviorLoggerProvider>
                  <UsageLoggerProvider>
                    <OntoEngineProvider>
                      <NoCodeBuilderProvider>
                        <SemanticAIProvider>
                          <TabManagerProvider>
                            {children}
                          </TabManagerProvider>
                        </SemanticAIProvider>
                      </NoCodeBuilderProvider>
                    </OntoEngineProvider>
                  </UsageLoggerProvider>
                </BehaviorLoggerProvider>
              </LearningEngineProvider>
            </ModuleRegistryProvider>
          </ContextEngineProvider>
        </NeuroProvider>
      </body>
    </html>
  )
}
