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
  ScanStoppedPayload
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

function getSaved<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch {
    return defaultValue
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // 100% Persisted States
  const [isScanning, setIsScanning] = useState<boolean>(() => getSaved('sc_isScanning', false))
  const [isPaused, setIsPaused] = useState<boolean>(() => getSaved('sc_isPaused', false))
  const [accounts, setAccounts] = useState<Account[]>(() => getSaved('sc_accounts', []))
  const [logs, setLogs] = useState<LogEntry[]>(() => getSaved('sc_logs', []))
  const [progress, setProgress] = useState<ProgressState>(() => getSaved('sc_progress', { completed: 0, total: 0, percentage: 0 }))
  const [summary, setSummary] = useState<ScanSummary | null>(() => getSaved('sc_summary', null))
  const [config, setConfig] = useState<ScannerConfig>(() => getSaved('sc_config', DEFAULT_CONFIG))

  // Dùng Ref để tránh stale closure trong useEffect mà không gây re-connect
  const isScanningRef = useRef(isScanning)
  useEffect(() => {
    isScanningRef.current = isScanning
  }, [isScanning])

  // Sync to Local Storage automatically
  useEffect(() => { localStorage.setItem('sc_isScanning', JSON.stringify(isScanning)) }, [isScanning])
  useEffect(() => { localStorage.setItem('sc_isPaused', JSON.stringify(isPaused)) }, [isPaused])
  useEffect(() => { localStorage.setItem('sc_accounts', JSON.stringify(accounts)) }, [accounts])
  useEffect(() => { localStorage.setItem('sc_logs', JSON.stringify(logs)) }, [logs])
  useEffect(() => { localStorage.setItem('sc_progress', JSON.stringify(progress)) }, [progress])
  useEffect(() => { localStorage.setItem('sc_summary', JSON.stringify(summary)) }, [summary])
  useEffect(() => { localStorage.setItem('sc_config', JSON.stringify(config)) }, [config])

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

    // Tự động kiểm tra chéo trạng thái với Server khi vừa vào web
    socket.on('sync-state', (state: { isScanning: boolean, isPaused: boolean }) => {
      // Tự sửa sai nếu Backend đã dừng nhưng Local Storage báo đang chạy
      if (!state.isScanning && isScanningRef.current) {
        setIsScanning(false)
        setIsPaused(false)
        addLog('info', 'HỆ THỐNG: Quá trình quét đã kết thúc khi bạn rời đi.')
      } else {
        setIsScanning(state.isScanning)
        setIsPaused(state.isPaused)
      }
    })

    socket.on('scan-started', (data: ScanStartedPayload) => {
      setIsScanning(true)
      setIsPaused(false)
      setAccounts([])
      setLogs([])
      setSummary(null)
      setProgress({ completed: 0, total: 0, percentage: 0 })
      addLog('info', data.message)
    })

    socket.on('accounts-fetched', (data: AccountsFetchedPayload) => {
      setProgress({ completed: 0, total: data.total, percentage: 0 })
      addLog('success', `Đã kết nối! Tìm thấy ${data.total} tài khoản cần kiểm tra`)
    })

    socket.on('log', (data: LogPayload) => {
      addLog(data.type, `[${data.carid}] ${data.message}`)
    })

    socket.on('progress', (data: ProgressPayload) => {
      setProgress(data)
    })

    socket.on('account-found', (account: Account) => {
      setAccounts(prev => {
        if (prev.some(a => a.carid === account.carid)) return prev
        return [...prev, account]
      })
      addLog('success', `TÌM THẤY: ${account.carid} (Loại: ${account.type})`)
    })

    socket.on('scan-completed', (data: ScanCompletedPayload) => {
      setIsScanning(false)
      setIsPaused(false)
      setSummary(data.summary)
      addLog('success', `Quét hoàn tất toàn bộ! Tìm thấy ${data.summary.enabled} tài khoản khả dụng`)
    })

    socket.on('scan-paused', () => {
      setIsPaused(true)
      addLog('warning', 'HỆ THỐNG: Đã TẠM DỪNG tiến trình quét.')
    })

    socket.on('scan-resumed', () => {
      setIsPaused(false)
      addLog('info', 'HỆ THỐNG: Đã TIẾP TỤC tiến trình quét.')
    })

    socket.on('scan-stopped', (data: ScanStoppedPayload) => {
      setIsScanning(false)
      setIsPaused(false)
      if (data.summary) setSummary(data.summary)
      addLog('error', data.message)
    })

    socket.on('scan-error', (data: ScanErrorPayload) => {
      setIsScanning(false)
      setIsPaused(false)
      addLog('error', data.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [config.serverUrl, addLog]) // <-- FIX: Đã gỡ isScanning ra khỏi mảng dependency

  const startScan = useCallback(() => {
    socketRef.current?.emit('start-scan', { userToken: config.userToken })
  }, [config.userToken])

  const pauseScan = useCallback(() => socketRef.current?.emit('pause-scan'), [])
  const resumeScan = useCallback(() => socketRef.current?.emit('resume-scan'), [])
  const stopScan = useCallback(() => socketRef.current?.emit('stop-scan'), [])

  const updateConfig = useCallback((updates: Partial<ScannerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    isConnected,
    isScanning,
    isPaused,
    accounts,
    logs,
    progress,
    summary,
    config,
    updateConfig,
    startScan,
    pauseScan,
    resumeScan,
    stopScan
  }
}
