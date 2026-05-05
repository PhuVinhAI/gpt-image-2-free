import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import type { LogEntry } from '@/types'

interface TerminalPanelProps {
  logs: LogEntry[]
  isScanning: boolean
}

const typeColor: Record<string, string> = {
  success: 'text-emerald-400/90',
  error: 'text-red-400/90',
  warning: 'text-amber-400/90',
  info: 'text-slate-400/60',
}

const typePrefix: Record<string, string> = {
  success: '✓',
  error: '✗',
  warning: '!',
  info: '›',
}

export function TerminalPanel({ logs, isScanning }: TerminalPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="flex flex-col min-h-0 h-full w-full rounded-2xl border border-white/[0.04] bg-[#060610] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-2">
        <div className="flex gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3 w-3 text-muted-foreground/30" />
          <span className="text-[10px] font-medium text-muted-foreground/30">
            Nhật ký hoạt động
          </span>
        </div>
        {isScanning && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[9px] text-violet-400/60">LIVE</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed scrollbar-thin scan-line"
      >
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground/15">Chờ lệnh quét...</span>
          </div>
        ) : (
          <div className="space-y-px">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2"
              >
                <span className="shrink-0 text-white/[0.08] select-none">{log.timestamp}</span>
                <span className={`shrink-0 w-2 text-center ${typeColor[log.type]}`}>
                  {typePrefix[log.type]}
                </span>
                <span className={typeColor[log.type]}>{log.message}</span>
              </motion.div>
            ))}
          </div>
        )}
        {isScanning && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-violet-400/60">$</span>
            <span className="inline-block h-3.5 w-1 animate-pulse bg-violet-400/70 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  )
}
