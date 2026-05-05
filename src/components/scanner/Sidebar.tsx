import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Rocket, KeyRound, Server, Zap, Clock, Settings2, Pause, Play, Square } from 'lucide-react'
import type { ScannerConfig } from '@/hooks/useSocket'

interface SidebarProps {
  config: ScannerConfig
  onConfigChange: (updates: Partial<ScannerConfig>) => void
  isScanning: boolean
  isPaused: boolean
  onStartScan: () => void
  onPauseScan: () => void
  onResumeScan: () => void
  onStopScan: () => void
  isConnected: boolean
}

export function Sidebar({ config, onConfigChange, isScanning, isPaused, onStartScan, onPauseScan, onResumeScan, onStopScan, isConnected }: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col gap-4 border-r border-white/[0.04] p-4 h-full overflow-y-auto scrollbar-thin"
    >
      <div className="flex items-center gap-2 mb-1">
        <Settings2 className="h-3.5 w-3.5 text-violet-400/70" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Cấu Hình
        </span>
      </div>

      <div className="space-y-3.5">
        <ConfigField
          icon={<KeyRound className="h-3.5 w-3.5" />}
          label="Mã xác thực"
        >
          <input
            type="text"
            value={config.userToken}
            onChange={e => onConfigChange({ userToken: e.target.value })}
            disabled={isScanning}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/30 focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 disabled:opacity-40"
            placeholder="Nhập token..."
          />
        </ConfigField>

        <ConfigField
          icon={<Server className="h-3.5 w-3.5" />}
          label="Máy chủ"
        >
          <input
            type="text"
            value={config.serverUrl}
            onChange={e => onConfigChange({ serverUrl: e.target.value })}
            disabled={isScanning}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs font-mono text-foreground outline-none transition-all placeholder:text-muted-foreground/30 focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20 disabled:opacity-40"
          />
        </ConfigField>

        <ConfigField
          icon={<Zap className="h-3.5 w-3.5" />}
          label={`Đồng thời: ${config.concurrency}`}
        >
          <input
            type="range"
            min="1"
            max="20"
            value={config.concurrency}
            onChange={e => onConfigChange({ concurrency: parseInt(e.target.value) })}
            disabled={isScanning}
            className="w-full disabled:opacity-40 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-0.5">
            <span>1</span>
            <span>10</span>
            <span>20</span>
          </div>
        </ConfigField>

        <ConfigField
          icon={<Clock className="h-3.5 w-3.5" />}
          label={`Thời gian chờ: ${config.timeout}s`}
        >
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={config.timeout}
            onChange={e => onConfigChange({ timeout: parseInt(e.target.value) })}
            disabled={isScanning}
            className="w-full disabled:opacity-40 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-0.5">
            <span>10s</span>
            <span>60s</span>
            <span>120s</span>
          </div>
        </ConfigField>
      </div>

      <div className="mt-auto pt-2">
        <AnimatePresence mode="wait">
          {!isScanning ? (
            <motion.button
              key="start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartScan}
              disabled={!isConnected}
              className="relative w-full overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.35)',
              }}
            >
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                <Rocket className="h-4 w-4" />
                Bắt Đầu Quét
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isPaused ? onResumeScan : onPauseScan}
                className={`w-full rounded-xl py-2.5 text-xs font-semibold text-white transition-all shadow-lg ${
                  isPaused
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isPaused ? <Play className="h-3.5 w-3.5" fill="currentColor" /> : <Pause className="h-3.5 w-3.5" fill="currentColor" />}
                  {isPaused ? 'Tiếp Tục Quét' : 'Tạm Dừng'}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStopScan}
                className="w-full rounded-xl bg-gradient-to-r from-red-500/90 to-rose-600/90 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-500 hover:to-rose-600"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Square className="h-3.5 w-3.5" fill="currentColor" />
                  Dừng Hẳn
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isConnected && (
          <p className="mt-2 text-center text-[10px] text-red-400/60">
            Chưa kết nối máy chủ
          </p>
        )}
      </div>
    </motion.aside>
  )
}

function ConfigField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60">
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}
