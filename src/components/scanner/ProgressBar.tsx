import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import type { ProgressState } from '@/types'

interface ProgressBarProps {
  progress: ProgressState
  isScanning: boolean
}

export function ProgressBar({ progress, isScanning, isPaused }: ProgressBarProps & { isPaused: boolean }) {
  const pct = typeof progress.percentage === 'string'
    ? parseFloat(progress.percentage)
    : progress.percentage

  return (
    <div className="flex items-center gap-4 px-5 py-2">
      <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
          <motion.circle
            cx="26" cy="26" r="22"
            fill="none"
            stroke="url(#progress-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 22}
            initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - pct / 100) }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ filter: pct > 0 ? 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' : 'none' }}
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-[11px] font-bold tabular-nums text-foreground/80">
          {pct > 0 ? `${pct.toFixed(0)}%` : '—'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className={`h-3 w-3 ${isScanning && !isPaused ? 'text-violet-400 animate-pulse' : 'text-muted-foreground/30'}`} />
            <span className="text-[11px] font-medium text-muted-foreground/60">
              {isScanning
                ? isPaused ? 'Đang tạm dừng' : 'Đang quét...'
                : progress.total > 0 ? 'Hoàn thành' : 'Chờ lệnh quét'}
            </span>
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground/40">
            {progress.completed}/{progress.total}
          </span>
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: isPaused
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {isScanning && !isPaused && (
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
