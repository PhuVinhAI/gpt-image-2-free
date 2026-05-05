import { motion } from 'framer-motion'
import { Loader2, Rocket, KeyRound, Server, Zap, Clock, Settings2 } from 'lucide-react'
import type { ScannerConfig } from '@/hooks/useSocket'

interface SidebarProps {
  config: ScannerConfig
  onConfigChange: (updates: Partial<ScannerConfig>) => void
  isScanning: boolean
  onStartScan: () => void
  isConnected: boolean
}

export function Sidebar({ config, onConfigChange, isScanning, onStartScan, isConnected }: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col gap-4 border-r border-white/[0.04] p-4 overflow-y-auto scrollbar-thin"
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
            className="w-full disabled:opacity-40"
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
            className="w-full disabled:opacity-40"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/30 mt-0.5">
            <span>10s</span>
            <span>60s</span>
            <span>120s</span>
          </div>
        </ConfigField>
      </div>

      <div className="mt-auto pt-2">
        <motion.button
          whileHover={!isScanning ? { scale: 1.02 } : {}}
          whileTap={!isScanning ? { scale: 0.98 } : {}}
          onClick={onStartScan}
          disabled={isScanning || !isConnected}
          className="relative w-full overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isScanning
              ? 'linear-gradient(135deg, #4c1d95, #312e81)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            boxShadow: isScanning ? 'none' : '0 8px 24px -4px rgba(139, 92, 246, 0.35)',
          }}
        >
          {!isScanning && (
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
          <span className="relative flex items-center justify-center gap-2">
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang quét...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Bắt Đầu Quét
              </>
            )}
          </span>
        </motion.button>

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
