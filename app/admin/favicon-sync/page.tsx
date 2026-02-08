"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, RefreshCw, CheckCircle, XCircle, Globe } from "lucide-react"

interface SyncResult {
  id: string
  url: string
  icon: string | null
  success: boolean
  error?: string
}

export default function FaviconSyncPage() {
  const [loading, setLoading] = useState(false)
  const [syncAll, setSyncAll] = useState(false)
  const [batchSize, setBatchSize] = useState(10)
  const [results, setResults] = useState<SyncResult[]>([])
  const [total, setTotal] = useState(0)
  const [updated, setUpdated] = useState(0)
  const [message, setMessage] = useState("")

  const handleSync = async () => {
    setLoading(true)
    setResults([])
    setMessage("")
    
    try {
      const response = await fetch("/api/admin/favicon-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          all: syncAll,
          batchSize: batchSize
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results || [])
        setTotal(data.total || 0)
        setUpdated(data.updated || 0)
        setMessage(data.message || "同步完成")
      } else {
        setMessage(data.error || "同步失败")
      }
    } catch (error) {
      setMessage("请求失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Favicon 同步</h1>
              <p className="text-sm text-muted-foreground">批量获取网站图标并缓存到数据库</p>
            </div>
          </div>
        </div>

        {/* 设置面板 */}
        <Card className="mb-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncAll"
                  checked={syncAll}
                  onChange={(e) => setSyncAll(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="syncAll" className="text-sm font-medium">
                  同步所有网站（包括已有图标的）
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="batchSize" className="text-sm font-medium">
                  批量大小：
                </label>
                <select
                  id="batchSize"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleSync}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  开始同步
                </>
              )}
            </Button>

            {message && (
              <div className={`mt-4 p-3 rounded ${message.includes("失败") ? "bg-red-50 text-red-800 border border-red-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
                {message}
              </div>
            )}
          </div>
        </Card>

        {/* 结果统计 */}
        {results.length > 0 && (
          <Card className="mb-6 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="text-sm text-blue-600 mb-1">处理总数</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-sm text-green-600 mb-1">成功</div>
                <div className="text-2xl font-bold">{updated}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border">
                <div className="text-sm text-red-600 mb-1">失败</div>
                <div className="text-2xl font-bold">{results.length - updated}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border">
                <div className="text-sm text-yellow-600 mb-1">成功率</div>
                <div className="text-2xl font-bold">
                  {results.length > 0 ? Math.round((updated / results.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 详细结果 */}
        {results.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">同步详情</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-3 rounded border flex items-center justify-between ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.url}</div>
                      {result.error && (
                        <div className="text-sm text-muted-foreground">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 使用说明 */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold mb-4">使用说明</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 系统会自动缓存已获取的 favicon，避免重复请求</li>
            <li>• 默认只同步没有图标的网站，勾选"同步所有网站"可重新获取所有图标</li>
            <li>• 建议批量大小设置为 10-20，避免请求过多导致失败</li>
            <li>• 获取失败的网站会使用默认图标占位符</li>
            <li>• 图标缓存有效期为 24 小时，超过后会重新获取</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}