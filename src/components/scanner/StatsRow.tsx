import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  EyeOff,
  HelpCircle,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import type { ScanSummary } from '@/types'

interface StatsRowProps {
  summary: ScanSummary | null
  progress: { completed: number; total: number }
}

interface StatDef {
  key: keyof ScanSummary
  label: string
  icon: LucideIcon
  color: string
  glow: string
}

const stats: StatDef[] = [
  { key: 'total', label: 'Tổng Số', icon: BarChart3, color: 'text-slate-400', glow: 'shadow-slate-500/10' },
  { key: 'enabled', label: 'Khả Dụng', icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  { key: 'disabled', label: 'Vô Hiệu', icon: XCircle, color: 'text-red-400', glow: 'shadow-red-500/10' },
  { key: 'hidden', label: 'Ẩn', icon: EyeOff, color: 'text-amber-400', glow: 'shadow-amber-500/10' },
  { key: 'notFound', label: 'Không Thấy', icon: HelpCircle, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
  { key: 'errors', label: 'Lỗi', icon: AlertTriangle, color: 'text-orange-400', glow: 'shadow-orange-500/10' },
]

export function StatsRow({ summary, progress }: StatsRowProps) {
  return (
    <div className="grid grid-cols-6 gap-2.5 px-5 py-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const value = summary ? summary[stat.key] : (stat.key === 'total' ? progress.total : 0)

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
            whileHover={{ y: -2, scale: 1.03 }}
            className={`glass-panel glow-border flex items-center gap-2.5 px-3 py-2.5 cursor-default transition-shadow hover:shadow-lg ${stat.glow}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${stat.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <motion.div
                key={value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`text-lg font-bold tabular-nums leading-none ${stat.color}`}
              >
                {value}
              </motion.div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/40 truncate">
                {stat.label}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
