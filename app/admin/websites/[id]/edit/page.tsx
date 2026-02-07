"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, ExternalLink, LogOut, LayoutDashboard, Globe, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: string
  name: string
}

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  categoryId: string
  tags?: string
  isFeatured: boolean
  isShow: boolean
}

export default function EditWebsitePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  
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
    loadData()
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

  async function loadData() {
    try {
      const [websiteRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/websites/${params.id}`),
        fetch("/api/categories")
      ])

      if (!websiteRes.ok) {
        throw new Error("网站不存在")
      }

      const website = await websiteRes.json()
      const cats = await categoriesRes.json()

      setCategories(cats)
      
      setTitle(website.title)
      setUrl(website.url)
      setDescription(website.description || "")
      setIcon(website.icon || "")
      setCategoryId(website.categoryId)
      setTags(website.tags || "")
      setIsFeatured(website.isFeatured)
      setIsShow(website.isShow)
    } catch (error) {
      setError("加载数据失败")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      if (!title || !url || !categoryId) {
        throw new Error("请填写所有必填项")
      }

      try {
        new URL(url)
      } catch {
        throw new Error("网址格式不正确")
      }

      const res = await fetch(`/api/admin/websites/${params.id}`, {
        method: "PATCH",
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
        throw new Error(data.error || "更新失败")
      }

      router.push("/admin/websites")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center">
        <Link href="/admin/websites">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">编辑网站</h1>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-3 text-sm text-white bg-red-500 rounded-md">
            {error}
          </div>
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
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="emoji 或图标 URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="搜索, 工具, 娱乐"
                  />
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
            <Button type="submit" disabled={saving}>
              {saving ? (
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
      </main>
    </div>
  )
}
