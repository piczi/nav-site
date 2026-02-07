"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Globe, 
  FolderTree, 
  LogOut,
  Loader2,
  ExternalLink,
  Star,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalWebsites: number
  totalCategories: number
  totalClicks: number
  featuredWebsites: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/check-auth")
      if (!res.ok) {
        router.push("/admin")
        return
      }
      const data = await res.json()
      if (!data.authenticated) {
        router.push("/admin")
      }
    } catch (error) {
      router.push("/admin")
    }
  }

  async function loadDashboardData() {
    try {
      const websitesRes = await fetch("/api/websites")
      const websites = await websitesRes.json()

      const categoriesRes = await fetch("/api/categories")
      const categories = await categoriesRes.json()

      const totalClicks = websites.reduce((sum: number, w: any) => sum + (w.clickCount || 0), 0)
      const featuredCount = websites.filter((w: any) => w.isFeatured).length

      setStats({
        totalWebsites: websites.length,
        totalCategories: categories.length,
        totalClicks,
        featuredWebsites: featuredCount
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card hidden lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">管理后台</span>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                仪表盘
              </Button>
            </Link>
            <Link href="/admin/websites">
              <Button variant="ghost" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                网站管理
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="ghost" className="w-full justify-start">
                <FolderTree className="mr-2 h-4 w-4" />
                分类管理
              </Button>
            </Link>
          </nav>

          <div className="border-t p-4 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                查看前台
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">仪表盘</h1>
          <span className="text-sm text-muted-foreground">管理员</span>
        </header>

        <div className="p-6">
          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
      </main>
    </div>
  )
}
