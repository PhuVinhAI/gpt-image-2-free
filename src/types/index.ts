export type LogType = 'info' | 'success' | 'error' | 'warning'

export interface LogEntry {
  type: LogType
  message: string
  timestamp: string
}

export interface ProgressState {
  completed: number
  total: number
  percentage: number
}

export interface Account {
  carid: string
  id: string
  type: string
  status: 'ENABLED' | 'DISABLED' | 'HIDDEN' | 'NOT_FOUND' | 'ERROR'
  enabled: boolean
  reason?: string
  error?: string
  loginUrl: string
  chatUrl: string
}

export interface ScanSummary {
  total: number
  enabled: number
  disabled: number
  hidden: number
  notFound: number
  errors: number
}

export interface ScanStartedPayload {
  message: string
}

export interface AccountsFetchedPayload {
  total: number
}

export interface LogPayload {
  carid: string
  message: string
  type: LogType
}

export interface ProgressPayload {
  completed: number
  total: number
  percentage: number
}

export interface ScanCompletedPayload {
  summary: ScanSummary
  results: Account[]
}

export interface ScanStoppedPayload {
  message: string
  summary?: ScanSummary
  results?: Account[]
}

export interface ScanErrorPayload {
  message: string
}
