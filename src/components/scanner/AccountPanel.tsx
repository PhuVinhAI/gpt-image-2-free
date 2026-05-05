import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, MessageSquare, CheckCircle2, ScanSearch } from 'lucide-react'
import type { Account } from '@/types'

interface AccountPanelProps {
  accounts: Account[]
  isScanning: boolean
}

export function AccountPanel({ accounts, isScanning }: AccountPanelProps) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/70" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Tài khoản khả dụng
          </span>
        </div>
        <motion.span
          key={accounts.length}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/10 px-1.5 text-[10px] font-bold tabular-nums text-emerald-400"
        >
          {accounts.length}
        </motion.span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
        <AnimatePresence mode="popLayout">
          {accounts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <ScanSearch className="mb-2 h-8 w-8 text-muted-foreground/10" />
              <p className="text-[11px] text-muted-foreground/30">
                {isScanning ? 'Đang tìm kiếm...' : 'Chưa có tài khoản'}
              </p>
            </motion.div>
          ) : (
            accounts.map((account, i) => (
              <motion.div
                key={account.carid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="group glass-panel glow-border p-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/30">#{i + 1}</span>
                    <span className="font-mono text-xs font-semibold text-foreground/90">{account.carid}</span>
                  </div>
                  <span className="rounded-full border border-indigo-500/15 bg-indigo-500/8 px-2 py-0.5 text-[9px] font-medium text-indigo-400/80">
                    Loại {account.type}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2.5 text-[10px]">
                  <span className="text-muted-foreground/35">ID: <span className="font-mono text-muted-foreground/60">{account.id}</span></span>
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-medium text-emerald-400/80">{account.status}</span>
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => window.open(account.loginUrl, '_blank')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/[0.04] bg-white/[0.02] py-1 text-[10px] font-medium text-muted-foreground/60 transition-all hover:bg-white/[0.05] hover:text-foreground/80"
                  >
                    <LogIn className="h-3 w-3" />
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => window.open(account.chatUrl, '_blank')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-600/80 to-indigo-600/80 py-1 text-[10px] font-medium text-white transition-all hover:brightness-110"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Trò Chuyện
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
