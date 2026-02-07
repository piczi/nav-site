"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Globe, 
  FolderTree, 
  BarChart3, 
  LogOut,
  Plus,
  Search,
  Loader2,
  ExternalLink,
  Edit,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  clickCount: number
  isFeatured: boolean
  isShow: boolean
  category: {
    name: string
  }
}

export default function WebsitesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [websites, setWebsites] = useState<Website[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    checkAuth()
    loadWebsites()
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
      console.error("Auth check failed:", error)
      router.push("/admin")
    }
  }

  async function loadWebsites() {
    try {
      // 使用 admin API 并添加时间戳防止缓存
      const res = await fetch(`/api/admin/websites?t=${Date.now()}`)
      if (!res.ok) throw new Error("加载失败")
      const data = await res.json()
      setWebsites(data)
    } catch (error) {
      console.error("Failed to load websites:", error)
      setError("加载数据失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个网站吗？")) return

    try {
      const res = await fetch(`/api/admin/websites/${id}`, {
        method: "DELETE"
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "删除失败")
      }

      // 重新加载数据而不是本地过滤
      await loadWebsites()
    } catch (error: any) {
      setError(error.message || "删除失败")
    }
  }

  async function handleToggleFeatured(id: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/websites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "更新失败")
      }

      // 重新加载数据
      await loadWebsites()
    } catch (error: any) {
      setError(error.message || "更新失败")
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Filter and paginate
  const filteredWebsites = websites.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.url.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const totalPages = Math.ceil(filteredWebsites.length / itemsPerPage)
  const paginatedWebsites = filteredWebsites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">管理后台</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                仪表盘
              </Button>
            </Link>
            <Link href="/admin/websites">
              <Button variant="secondary" className="w-full justify-start">
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

          {/* Bottom Actions */}
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
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">网站管理</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/websites/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                添加网站
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索网站..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Websites Table */}
          {paginatedWebsites.length > 0 ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">网站</th>
                      <th className="text-left p-4 font-medium">分类</th>
                      <th className="text-left p-4 font-medium">点击量</th>
                      <th className="text-left p-4 font-medium">状态</th>
                      <th className="text-left p-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedWebsites.map((website) => (
                      <tr key={website.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                              {website.icon || website.title.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium">{website.title}</h4>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {website.url}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full bg-muted text-sm">
                            {website.category.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{website.clickCount.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {website.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              website.isShow 
                                ? "bg-green-100 text-green-700" 
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {website.isShow ? "显示" : "隐藏"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(website.id, website.isFeatured)}
                            >
                              <Star className={`h-4 w-4 ${website.isFeatured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            </Button>
                            <Link href={`/admin/websites/${website.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(website.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(website.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredWebsites.length)} 共 {filteredWebsites.length} 条
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无网站</h3>
              <p className="text-muted-foreground mb-4">
                还没有添加任何网站
              </p>
              <Link href="/admin/websites/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个网站
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


