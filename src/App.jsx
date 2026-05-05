import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const socket = io('http://localhost:3001');

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [summary, setSummary] = useState(null);
  const [userToken, setUserToken] = useState('tomisakae0000');

  useEffect(() => {
    socket.on('scan-started', (data) => {
      setIsScanning(true);
      setAccounts([]);
      setLogs([]);
      setSummary(null);
      addLog('info', data.message);
    });

    socket.on('accounts-fetched', (data) => {
      setProgress({ completed: 0, total: data.total, percentage: 0 });
      addLog('success', `Tìm thấy ${data.total} tài khoản cần kiểm tra`);
    });

    socket.on('log', (data) => {
      addLog(data.type, `[${data.carid}] ${data.message}`);
    });

    socket.on('progress', (data) => {
      setProgress(data);
    });

    socket.on('account-found', (account) => {
      setAccounts(prev => [...prev, account]);
      addLog('success', `✅ TÌM THẤY: ${account.carid} (Loại: ${account.type})`);
    });

    socket.on('scan-completed', (data) => {
      setIsScanning(false);
      setSummary(data.summary);
      addLog('success', `Quét hoàn tất! Tìm thấy ${data.summary.enabled} tài khoản khả dụng`);
    });

    socket.on('scan-error', (data) => {
      setIsScanning(false);
      addLog('error', data.message);
    });

    return () => {
      socket.off('scan-started');
      socket.off('accounts-fetched');
      socket.off('log');
      socket.off('progress');
      socket.off('account-found');
      socket.off('scan-completed');
      socket.off('scan-error');
    };
  }, []);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { type, message, timestamp }].slice(-100));
  };

  const startScan = () => {
    socket.emit('start-scan', { userToken });
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔍</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SharedChat Scanner
              </h1>
              <p className="text-sm text-muted-foreground">Quét tài khoản tự động với chống phát hiện</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Bảng Điều Khiển</CardTitle>
            <CardDescription>Nhập token và bắt đầu quét tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">User Token:</label>
                <Input
                  type="text"
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  disabled={isScanning}
                  placeholder="Nhập token của bạn"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={startScan}
                  disabled={isScanning}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isScanning ? '⏳ Đang Quét...' : '🚀 Bắt Đầu Quét'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {progress.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Tiến Độ</CardTitle>
              <CardDescription>
                {progress.completed} / {progress.total} tài khoản đã kiểm tra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress.percentage} className="h-3" />
              <div className="text-center text-2xl font-bold text-purple-600">
                {progress.percentage}%
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle>📈 Tổng Kết</CardTitle>
              <CardDescription>Kết quả quét tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{summary.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Tổng Số</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">{summary.enabled}</div>
                  <div className="text-sm text-muted-foreground mt-1">✅ Khả Dụng</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <div className="text-3xl font-bold text-red-700 dark:text-red-400">{summary.disabled}</div>
                  <div className="text-sm text-muted-foreground mt-1">❌ Vô Hiệu</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{summary.hidden}</div>
                  <div className="text-sm text-muted-foreground mt-1">🙈 Ẩn</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{summary.notFound}</div>
                  <div className="text-sm text-muted-foreground mt-1">❓ Không Tìm Thấy</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{summary.errors}</div>
                  <div className="text-sm text-muted-foreground mt-1">⚠️ Lỗi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Enabled Accounts */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>✅ Tài Khoản Khả Dụng</span>
                <Badge variant="secondary" className="text-lg">{accounts.length}</Badge>
              </CardTitle>
              <CardDescription>Các tài khoản có thể tạo hình ảnh</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {isScanning ? '🔍 Đang quét tìm tài khoản khả dụng...' : '📭 Chưa tìm thấy tài khoản khả dụng'}
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {accounts.map((account, index) => (
                    <Card key={account.carid} className="border-2 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            #{index + 1} - {account.carid}
                          </CardTitle>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                            Loại {account.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ID:</span>
                            <span className="font-mono font-semibold">{account.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Trạng Thái:</span>
                            <Badge variant="default" className="bg-green-600">✅ {account.status}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => openLink(account.loginUrl)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            🔐 Đăng Nhập
                          </Button>
                          <Button
                            onClick={() => openLink(account.chatUrl)}
                            variant="default"
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            💬 Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>📝 Nhật Ký Hoạt Động</CardTitle>
              <CardDescription>Theo dõi quá trình quét real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-12">Chưa có nhật ký</div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${
                          log.type === 'success'
                            ? 'text-green-400'
                            : log.type === 'error'
                            ? 'text-red-400'
                            : log.type === 'warning'
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      >
                        <span className="text-gray-600 dark:text-gray-500 shrink-0">[{log.timestamp}]</span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>🚀 SharedChat Scanner - Công cụ quét tài khoản tự động với công nghệ chống phát hiện</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
