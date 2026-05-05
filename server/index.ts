import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import cors from 'cors'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import pLimit from 'p-limit'
import type { Browser, Page } from 'puppeteer'

puppeteer.use(StealthPlugin())

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

interface Config {
  usertoken: string
  baseUrl: string
  apiUrl: string
  timeout: number
  selectorTimeout: number
  concurrency: number
}

const CONFIG: Config = {
  usertoken: 'tomisakae0000',
  baseUrl: 'https://chat.sharedchat.fun',
  apiUrl: 'https://sharedchat.fun/GetAccountList2',
  timeout: 60000,
  selectorTimeout: 20000,
  concurrency: 10,
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
]

function randomDelay(min = 1000, max = 3000): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

interface AccountInfo {
  carid: string
  id: string
  type: string
  [key: string]: unknown
}

interface ScanResult {
  carid: string
  id: string
  type: string
  status: 'ENABLED' | 'DISABLED' | 'HIDDEN' | 'NOT_FOUND' | 'ERROR'
  enabled: boolean
  reason?: string
  error?: string
  loginUrl?: string
  chatUrl?: string
}

interface ImageFeatureStatus {
  found: boolean
  disabled?: boolean
  hasDataDisabled?: boolean
  isHidden?: boolean
}

// === Tác vụ điều hướng toàn cục ===
let scanState = {
  isPaused: false,
  shouldStop: false
}

async function getAccountList(): Promise<AccountInfo[]> {
  try {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const tParam = `${timestamp}_${randomStr}`

    const response = await fetch(`${CONFIG.apiUrl}?t=${tParam}`)
    const data = await response.json()

    if (data.code === 200 && data.msg === 'SUCCESS') {
      return data.data
    }
    throw new Error('Failed to fetch account list')
  } catch (error) {
    console.error('Error fetching accounts:', (error as Error).message)
    return []
  }
}

async function checkImageFeatureStatus(
  browser: Browser,
  carid: string,
  accountInfo: AccountInfo,
  socket: Socket
): Promise<ScanResult | null> {
  const context = await browser.createBrowserContext()
  const page: Page = await context.newPage()

  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
    await page.setUserAgent(randomUA)

    const randomViewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)]
    await page.setViewport(randomViewport)

    await page.setExtraHTTPHeaders({
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      Connection: 'keep-alive',
    })

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] })
      ;(window as any).chrome = { runtime: {} }
    })

    socket.emit('log', { carid, message: 'Đang đăng nhập...', type: 'info' })

    const loginUrl = `${CONFIG.baseUrl}/auth/logintoken?carid=${carid}&usertoken=${CONFIG.usertoken}`
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.timeout })

    // Check Pause & Stop
    while (scanState.isPaused && !scanState.shouldStop) { await delay(500) }
    if (scanState.shouldStop) return null

    await delay(randomDelay(4000, 6000))

    const currentUrl = page.url()
    if (!currentUrl.includes('chat.sharedchat.fun') || currentUrl.includes('login')) {
      throw new Error('Đăng nhập thất bại')
    }

    socket.emit('log', { carid, message: 'Đang tìm nút tạo ảnh...', type: 'info' })

    const plusButtonSelector = 'button[data-testid="composer-plus-btn"]'
    try {
      await page.waitForSelector(plusButtonSelector, { timeout: CONFIG.selectorTimeout })
    } catch {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Check Pause & Stop
      while (scanState.isPaused && !scanState.shouldStop) { await delay(500) }
      if (scanState.shouldStop) return null

      await delay(randomDelay(1500, 2500))
      await page.waitForSelector(plusButtonSelector, { timeout: CONFIG.selectorTimeout })
    }

    // Check Pause & Stop
    while (scanState.isPaused && !scanState.shouldStop) { await delay(500) }
    if (scanState.shouldStop) return null

    await delay(randomDelay(300, 800))
    await page.click(plusButtonSelector)
    await delay(randomDelay(1500, 2500))

    const imageFeatureStatus: ImageFeatureStatus = await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll('[role="menuitemradio"]'))

      const imageMenuItem = menuItems.find((item) => {
        const text = item.textContent?.trim() || ''
        return text.includes('Tao hinh anh') || text.includes('Create image')
      })

      if (!imageMenuItem) {
        const allItems = Array.from(document.querySelectorAll('[role="menuitemradio"]'))
        const imageByIcon = allItems.find((item) => {
          const svg = item.querySelector('use[href*="#266724"]')
          return svg !== null
        })

        if (imageByIcon) {
          const isDisabled = imageByIcon.getAttribute('aria-disabled') === 'true'
          const hasDataDisabled = imageByIcon.hasAttribute('data-disabled')
          const parentSpan = imageByIcon.closest('span')
          const parentSpanState = parentSpan?.getAttribute('data-state')
          const isHidden =
            parentSpan &&
            (parentSpanState === 'closed' ||
              window.getComputedStyle(parentSpan).display === 'none')

          return {
            found: true,
            disabled: isDisabled,
            hasDataDisabled: hasDataDisabled,
            isHidden: !!isHidden,
          }
        }

        return { found: false }
      }

      const isDisabled = imageMenuItem.getAttribute('aria-disabled') === 'true'
      const hasDataDisabled = imageMenuItem.hasAttribute('data-disabled')
      const parentSpan = imageMenuItem.closest('span')
      const parentSpanState = parentSpan?.getAttribute('data-state')
      const isHidden =
        parentSpan &&
        (parentSpanState === 'closed' ||
          window.getComputedStyle(parentSpan).display === 'none')

      return {
        found: true,
        disabled: isDisabled,
        hasDataDisabled: hasDataDisabled,
        isHidden: !!isHidden,
      }
    })

    if (!imageFeatureStatus.found) {
      socket.emit('log', { carid, message: 'Tính năng không tồn tại', type: 'error' })
      return {
        carid,
        id: accountInfo.id,
        type: accountInfo.type,
        status: 'NOT_FOUND',
        enabled: false,
      }
    }

    const isEnabled =
      !imageFeatureStatus.disabled &&
      !imageFeatureStatus.hasDataDisabled &&
      !imageFeatureStatus.isHidden

    let status: ScanResult['status']
    let reason: string

    if (imageFeatureStatus.isHidden) {
      status = 'HIDDEN'
      reason = 'Tính năng bị ẩn'
      socket.emit('log', { carid, message: 'Tính năng bị ẩn', type: 'warning' })
    } else if (imageFeatureStatus.disabled || imageFeatureStatus.hasDataDisabled) {
      status = 'DISABLED'
      reason = 'Tính năng bị vô hiệu hoá'
      socket.emit('log', { carid, message: 'Tính năng bị vô hiệu hoá', type: 'warning' })
    } else {
      status = 'ENABLED'
      reason = 'Tính năng khả dụng'
      socket.emit('log', { carid, message: '✅ KHẢ DỤNG!', type: 'success' })
    }

    return {
      carid,
      id: accountInfo.id,
      type: accountInfo.type,
      status,
      enabled: isEnabled,
      reason,
      loginUrl: `${CONFIG.baseUrl}/auth/logintoken?carid=${carid}&usertoken=${CONFIG.usertoken}`,
      chatUrl: CONFIG.baseUrl,
    }
  } catch (error) {
    socket.emit('log', { carid, message: `Lỗi: ${(error as Error).message}`, type: 'error' })
    return {
      carid,
      id: accountInfo.id,
      type: accountInfo.type,
      status: 'ERROR',
      enabled: false,
      error: (error as Error).message,
    }
  } finally {
    await context.close()
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('start-scan', async (data) => {
    if (data?.userToken) CONFIG.usertoken = data.userToken

    // Reset control states
    scanState = { isPaused: false, shouldStop: false }
    console.log('Bắt đầu quét...')

    socket.emit('scan-started', { message: 'Đang kết nối SharedChat để tải danh sách tài khoản...' })

    const accounts = await getAccountList()
    if (accounts.length === 0) {
      socket.emit('scan-error', { message: 'Không tìm thấy tài khoản nào' })
      return
    }

    socket.emit('accounts-fetched', { total: accounts.length })

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    })

    const limit = pLimit(CONFIG.concurrency)
    let completed = 0

    const checkPromises = accounts.map((account) =>
      limit(async () => {
        // Abort right away if stopped
        if (scanState.shouldStop) return null

        // Idle if paused
        while (scanState.isPaused && !scanState.shouldStop) {
          await delay(500)
        }

        // Re-check stop after pause
        if (scanState.shouldStop) return null

        const result = await checkImageFeatureStatus(browser, account.carid, account, socket)

        // Null means it aborted mid-flight
        if (result === null) return null

        completed++

        socket.emit('progress', {
          completed,
          total: accounts.length,
          percentage: Math.round((completed / accounts.length) * 1000) / 10,
        })

        if (result.enabled) {
          socket.emit('account-found', result)
        }

        return result
      })
    )

    const rawResults = await Promise.all(checkPromises)
    await browser.close()

    const results = rawResults.filter((r): r is ScanResult => r !== null)
    const enabled = results.filter((r) => r.enabled)

    const summary = {
      total: results.length,
      enabled: enabled.length,
      disabled: results.filter((r) => r.status === 'DISABLED').length,
      hidden: results.filter((r) => r.status === 'HIDDEN').length,
      notFound: results.filter((r) => r.status === 'NOT_FOUND').length,
      errors: results.filter((r) => r.status === 'ERROR').length,
    }

    if (scanState.shouldStop) {
      socket.emit('scan-stopped', { message: 'Đã dừng tiến trình quét thành công.', summary, results: enabled })
    } else {
      socket.emit('scan-completed', { summary, results: enabled })
    }
  })

  // === Control Event Listeners ===
  socket.on('pause-scan', () => {
    scanState.isPaused = true
    socket.emit('scan-paused')
  })

  socket.on('resume-scan', () => {
    scanState.isPaused = false
    socket.emit('scan-resumed')
  })

  socket.on('stop-scan', () => {
    scanState.shouldStop = true
    socket.emit('log', { carid: 'HỆ THỐNG', message: 'Đã nhận lệnh huỷ. Đang xử lý các tài khoản còn dang dở để đóng trình duyệt an toàn...', type: 'warning' })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

app.get('/api/config', (_req, res) => {
  res.json({ concurrency: CONFIG.concurrency, baseUrl: CONFIG.baseUrl })
})

app.post('/api/config', (req, res) => {
  const { usertoken } = req.body
  if (usertoken) {
    CONFIG.usertoken = usertoken
    res.json({ success: true, message: 'Đã cập nhật Token' })
  } else {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp Token' })
  }
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại http://localhost:${PORT}`)
})
