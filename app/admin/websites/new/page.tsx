"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Globe, 
  FolderTree, 
  ArrowLeft,
  Loader2,
  LogOut,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewWebsitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  
  // Form state
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isShow, setIsShow] = useState(true)

  useEffect(() => {
    checkAuth()
    loadCategories()
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

  async function loadCategories() {
    try {
      const res = await fetch(`/api/admin/categories?t=${Date.now()}`)
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate
      if (!title || !url || !categoryId) {
        throw new Error("请填写所有必填项")
      }

      // Validate URL
      try {
        new URL(url)
      } catch {
        throw new Error("网址格式不正确")
      }

      const res = await fetch("/api/admin/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          description,
          icon,
          categoryId,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          isFeatured,
          isShow
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "创建失败")
      }

      // Redirect to websites list
      router.push("/admin/websites")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" })
                router.push("/admin")
              }}
            >
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
            <Link href="/admin/websites">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">添加网站</h1>
          </div>
        </header>

        {/* Form */}
        <div className="p-6 max-w-3xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>填写网站的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">网站名称 *</Label>
                    <Input
                      id="title"
                      placeholder="例如：Google"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">网站地址 *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://www.google.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">所属分类 *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">网站描述</Label>
                  <Textarea
                    id="description"
                    placeholder="简要描述这个网站的功能和特点..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>高级设置</CardTitle>
                <CardDescription>配置网站的显示和行为</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">图标</Label>
                    <Input
                      id="icon"
                      placeholder="emoji 或图标 URL"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      支持 emoji 或图片链接
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">标签</Label>
                    <Input
                      id="tags"
                      placeholder="搜索, 工具, 娱乐"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      用逗号分隔多个标签
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="featured">推荐网站</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show"
                      checked={isShow}
                      onCheckedChange={setIsShow}
                    />
                    <Label htmlFor="show">显示网站</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Link href="/admin/websites">
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
