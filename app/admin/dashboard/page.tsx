"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Loader2,
  Globe, 
  FolderTree,
  Star,
  TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchDashboardStats, UnauthorizedError, type DashboardStats } from "./dashboard.service"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let isMounted = true;
    
    async function loadDashboardData() {
      try {
        const nextStats = await fetchDashboardStats();
        if (isMounted) {
          setStats(nextStats);
        }
      } catch (error: unknown) {
        // DashboardPage 不应该处理鉴权，这由 AdminLayout 负责
        // 如果出现 UnauthorizedError，说明 AdminLayout 的鉴权有问题
        if (error instanceof UnauthorizedError) {
          console.error("DashboardPage 不应该收到 UnauthorizedError，这由 AdminLayout 处理");
          return;
        }
        
        console.error("Failed to load dashboard data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground">查看网站和分类的统计信息</p>
      </div>
      
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总网站数</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebsites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">分类数量</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总点击量</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">推荐网站</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredWebsites}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}