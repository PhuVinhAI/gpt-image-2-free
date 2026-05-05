import { motion } from 'framer-motion'
import { ScanLine, Wifi, WifiOff } from 'lucide-react'

interface HeaderProps {
  isConnected: boolean
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-14 items-center justify-between border-b border-white/[0.04] px-5 glass"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20"
        >
          <ScanLine className="h-4 w-4 text-white" />
        </motion.div>
        <div className="leading-tight">
          <h1 className="gradient-text text-base font-bold tracking-tight">
            SharedChat Scanner
          </h1>
          <p className="text-[10px] text-muted-foreground/50 tracking-wide uppercase">
            Trung tâm điều khiển quét tài khoản
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-3 py-1">
          {isConnected ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <Wifi className="h-3 w-3 text-emerald-400/80" />
              <span className="text-[10px] font-medium text-emerald-400/80">Đã kết nối</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500/80" />
              <WifiOff className="h-3 w-3 text-red-400/80" />
              <span className="text-[10px] font-medium text-red-400/80">Mất kết nối</span>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
