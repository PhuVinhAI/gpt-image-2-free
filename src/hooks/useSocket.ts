import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type {
  Account,
  LogEntry,
  LogType,
  ProgressState,
  ScanSummary,
  ScanStartedPayload,
  AccountsFetchedPayload,
  LogPayload,
  ProgressPayload,
  ScanCompletedPayload,
  ScanErrorPayload,
} from '@/types'

export interface ScannerConfig {
  serverUrl: string
  userToken: string
  concurrency: number
  timeout: number
}

const DEFAULT_CONFIG: ScannerConfig = {
  serverUrl: 'http://localhost:3001',
  userToken: 'tomisakae0000',
  concurrency: 10,
  timeout: 60,
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Load from localStorage on mount
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('sharedchat_accounts')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [progress, setProgress] = useState<ProgressState>({ completed: 0, total: 0, percentage: 0 })
  const [summary, setSummary] = useState<ScanSummary | null>(null)
  const [config, setConfig] = useState<ScannerConfig>(DEFAULT_CONFIG)

  // Sync accounts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sharedchat_accounts', JSON.stringify(accounts))
  }, [accounts])

  const addLog = useCallback((type: LogType, message: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN')
    setLogs(prev => [...prev, { type, message, timestamp }].slice(-200))
  }, [])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    const socket = io(config.serverUrl)
    socketRef.current = socket

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('scan-started', (data: ScanStartedPayload) => {
      setIsScanning(true)
      setAccounts([])
      setLogs([])
      setSummary(null)
      setProgress({ completed: 0, total: 0, percentage: 0 })
      addLog('info', data.message)
    })

    socket.on('accounts-fetched', (data: AccountsFetchedPayload) => {
      setProgress({ completed: 0, total: data.total, percentage: 0 })
      addLog('success', `Tìm thấy ${data.total} tài khoản cần kiểm tra`)
    })

    socket.on('log', (data: LogPayload) => {
      addLog(data.type, `[${data.carid}] ${data.message}`)
    })

    socket.on('progress', (data: ProgressPayload) => {
      setProgress(data)
    })

    socket.on('account-found', (account: Account) => {
      setAccounts(prev => [...prev, account])
      addLog('success', `TÌM THẤY: ${account.carid} (Loại: ${account.type})`)
    })

    socket.on('scan-completed', (data: ScanCompletedPayload) => {
      setIsScanning(false)
      setSummary(data.summary)
      addLog('success', `Quét hoàn tất! Tìm thấy ${data.summary.enabled} tài khoản khả dụng`)
    })

    socket.on('scan-error', (data: ScanErrorPayload) => {
      setIsScanning(false)
      addLog('error', data.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [config.serverUrl, addLog])

  const startScan = useCallback(() => {
    socketRef.current?.emit('start-scan', { userToken: config.userToken })
  }, [config.userToken])

  const updateConfig = useCallback((updates: Partial<ScannerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    isConnected,
    isScanning,
    accounts,
    logs,
    progress,
    summary,
    config,
    updateConfig,
    startScan,
  }
}
