"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Loader2,
  Clock,
  Database,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FaviconStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  cacheMisses: number
  successRate: string
  cacheHitRate: string
  lastUpdated: string
}

export default function FaviconStatsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<FaviconStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/favicon-stats")
      if (!res.ok) throw new Error("加载失败")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load favicon stats:", error)
      setError("加载统计数据失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetStats() {
    if (!confirm("确定要重置统计数据吗？")) return

    try {
      setRefreshing(true)
      const res = await fetch("/api/admin/favicon-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      })

      if (!res.ok) throw new Error("重置失败")
      await loadStats()
    } catch (error: any) {
      setError(error.message || "重置失败")
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-xl font-bold">图标统计</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={loadStats}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleResetStats}
            disabled={refreshing}
          >
            重置统计
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* 总请求数 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总请求数</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  图标获取总次数
                </p>
              </CardContent>
            </Card>

            {/* 成功率 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">成功率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: stats.totalRequests > 0 ? `${(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.successfulRequests.toLocaleString()} / {stats.totalRequests.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 缓存命中率 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">缓存命中率</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheHitRate}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: stats.totalRequests > 0 ? `${(stats.cacheHits / stats.totalRequests * 100).toFixed(2)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.cacheHits.toLocaleString()} / {stats.totalRequests.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 最后更新时间 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最后更新</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  统计信息更新时间
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 详细统计 */}
        {stats && (
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            {/* 成功/失败统计 */}
            <Card>
              <CardHeader>
                <CardTitle>请求结果统计</CardTitle>
                <CardDescription>图标获取的成功与失败情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>成功请求</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.successfulRequests.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({stats.successRate})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>失败请求</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.failedRequests.toLocaleString()}</span>
                       <span className="text-sm text-muted-foreground">
                         ({stats.totalRequests > 0 ? ((stats.failedRequests / stats.totalRequests) * 100).toFixed(2) : "0.00"}%)
                       </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 缓存统计 */}
            <Card>
              <CardHeader>
                <CardTitle>缓存统计</CardTitle>
                <CardDescription>内存缓存命中情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>缓存命中</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.cacheHits.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({stats.cacheHitRate})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>缓存未命中</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.cacheMisses.toLocaleString()}</span>
                       <span className="text-sm text-muted-foreground">
                         ({stats.totalRequests > 0 ? ((stats.cacheMisses / stats.totalRequests) * 100).toFixed(2) : "0.00"}%)
                       </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>统计说明</CardTitle>
            <CardDescription>图标获取系统的性能指标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>总请求数</strong>: 通过 /api/favicon 代理获取图标的总次数</p>
            <p>• <strong>成功率</strong>: 成功获取到图标的请求比例（包括缓存命中）</p>
            <p>• <strong>缓存命中率</strong>: 直接从内存缓存返回图标的请求比例</p>
            <p>• <strong>缓存策略</strong>: 内存缓存有效期为24小时，生产环境建议使用Redis</p>
            <p>• <strong>数据来源</strong>: 优先使用网站直接favicon，失败时使用第三方API服务</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}