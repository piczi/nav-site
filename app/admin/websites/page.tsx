"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus,
  Search,
  Loader2,
  ExternalLink,
  Edit,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Upload
} from "lucide-react"
import { ImportModal } from "@/components/admin/import-modal"
import { WebsiteIcon } from "@/components/website-icon"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [websites, setWebsites] = useState<Website[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [importModalOpen, setImportModalOpen] = useState(false)

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    try {
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

      await loadWebsites()
    } catch (error: any) {
      setError(error.message || "更新失败")
    }
  }

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
          <h1 className="text-xl font-bold">网站管理</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
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

        {/* Websites List */}
        {paginatedWebsites.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedWebsites.map((website) => (
                <div key={website.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <WebsiteIcon url={website.url} title={website.title} icon={website.icon} size="lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{website.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{website.url}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="px-2 py-1 rounded-full bg-muted text-xs">
                      {website.category.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {website.clickCount.toLocaleString()} 次点击
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
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
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleFeatured(website.id, website.isFeatured)}
                    >
                      <Star className={`h-3 w-3 mr-1 ${website.isFeatured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                      {website.isFeatured ? "取消推荐" : "推荐"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(website.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Link href={`/admin/websites/${website.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(website.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
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
              <Loader2 className="h-8 w-8 text-muted-foreground" />
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

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        type="websites"
        title="网站"
        onSuccess={() => {
          loadWebsites()
        }}
      />
    </div>
  )
}
