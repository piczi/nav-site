"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [icon, setIcon] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!name || !slug) {
        throw new Error("请填写名称和标识")
      }

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          color,
          icon
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "创建失败")
      }

      router.push("/admin/categories")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">添加分类</h1>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-3 text-sm text-white bg-red-500 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>填写分类的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">分类名称 *</Label>
                  <Input
                    id="name"
                    placeholder="例如：开发工具"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL 标识 *</Label>
                  <Input
                    id="slug"
                    placeholder="例如：dev-tools"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    用于 URL，只能包含字母、数字和连字符
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  placeholder="简要描述这个分类..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">主题色</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">图标</Label>
                  <Input
                    id="icon"
                    placeholder="emoji 或图标"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/categories">
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
      </main>
    </div>
  )
}
