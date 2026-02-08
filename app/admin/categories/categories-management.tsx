"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  ArrowUpDown,
  Upload
} from "lucide-react"
import { ImportModal } from "@/components/admin/import-modal"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  sort: number
  isShow: boolean
  _count?: {
    websites: number
  }
}

export function CategoriesManagement() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [importModalOpen, setImportModalOpen] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const res = await fetch(`/api/admin/categories?t=${Date.now()}`)
      if (!res.ok) throw new Error("加载失败")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
      setError("加载数据失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个分类吗？该分类下的网站将被移到未分类。")) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "删除失败")
      }

      await loadCategories()
    } catch (error: any) {
      setError(error.message || "删除失败")
    }
  }

  async function handleMoveSort(id: string, direction: "up" | "down") {
    const index = categories.findIndex(c => c.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) return

    const newCategories = [...categories]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    
    const temp = newCategories[index]
    newCategories[index] = newCategories[targetIndex]
    newCategories[targetIndex] = temp
    
    newCategories.forEach((cat, idx) => {
      cat.sort = idx
    })
    
    setCategories(newCategories)

    try {
      await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newCategories.map(c => ({ id: c.id, sort: c.sort })) })
      })
    } catch (error) {
      console.error("Failed to save sort order:", error)
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-xl font-bold">分类管理</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            批量导入
          </Button>
          <Link href="/admin/categories/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加分类
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
              placeholder="搜索分类..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Table */}
        {filteredCategories.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">排序</th>
                  <th className="text-left p-4 font-medium">分类</th>
                  <th className="text-left p-4 font-medium">标识</th>
                  <th className="text-left p-4 font-medium">网站数</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveSort(category.id, "up")}
                          disabled={categories.findIndex(c => c.id === category.id) === 0}
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ 
                            backgroundColor: `${category.color}20` || '#3b82f620',
                            color: category.color || '#3b82f6'
                          }}
                        >
                          {category.icon || category.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{category._count?.websites || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.isShow 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {category.isShow ? "显示" : "隐藏"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无分类</h3>
            <p className="text-muted-foreground mb-4">
              还没有添加任何分类
            </p>
            <Link href="/admin/categories/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                添加第一个分类
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        type="categories"
        title="分类"
        onSuccess={() => {
          loadCategories()
        }}
      />
    </div>
  )
}
