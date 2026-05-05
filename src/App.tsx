import { useSocket } from '@/hooks/useSocket'
import { AnimatedBackground } from '@/components/effects/AnimatedBackground'
import { ParticleField } from '@/components/effects/ParticleField'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/scanner/Sidebar'
import { StatsRow } from '@/components/scanner/StatsRow'
import { ProgressBar } from '@/components/scanner/ProgressBar'
import { AccountPanel } from '@/components/scanner/AccountPanel'
import { TerminalPanel } from '@/components/scanner/TerminalPanel'

function App() {
  const {
    isConnected,
    isScanning,
    accounts,
    logs,
    progress,
    summary,
    config,
    updateConfig,
    startScan,
  } = useSocket()

  return (
    <div className="relative h-screen overflow-hidden grid-pattern">
      <AnimatedBackground />
      <ParticleField />

      <div className="relative z-10 flex h-full flex-col">
        <Header isConnected={isConnected} />

        <div className="flex flex-1 min-h-0">
          <div className="w-64 shrink-0">
            <Sidebar
              config={config}
              onConfigChange={updateConfig}
              isScanning={isScanning}
              onStartScan={startScan}
              isConnected={isConnected}
            />
          </div>

          <div className="flex flex-1 flex-col min-h-0 min-w-0">
            <StatsRow summary={summary} progress={progress} />
            <ProgressBar progress={progress} isScanning={isScanning} />

            <div className="flex flex-1 min-h-0 gap-3 px-5 pb-4">
              <div className="flex-1 min-w-0 h-full glass-panel overflow-hidden">
                <AccountPanel accounts={accounts} isScanning={isScanning} />
              </div>
              <div className="flex-1 min-w-0 h-full">
                <TerminalPanel logs={logs} isScanning={isScanning} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
