"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Grid3X3, List, ExternalLink, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Skeleton } from "@/components/ui/skeleton"
import { WebsiteIcon } from "@/components/website-icon"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
}

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  clickCount: number
  isFeatured: boolean
  category: Category
}

export function CategoryContent({ slug }: { slug: string }) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  async function fetchCategoryData() {
    setLoading(true)
    try {
      const [catRes, webRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/websites?category=${slug}`)
      ])

      const categories = await catRes.json()
      const foundCategory = categories.find((c: Category) => c.slug === slug)
      
      if (!foundCategory) {
        router.push("/")
        return
      }
      
      setCategory(foundCategory)
      const websitesData = await webRes.json()
      setWebsites(websitesData)
    } catch (error) {
      console.error("Failed to fetch category data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleWebsiteClick(websiteId: string, url: string) {
    try {
      await fetch(`/api/websites/${websiteId}/click`, { method: "POST" })
      window.open(url, "_blank")
    } catch (error) {
      window.open(url, "_blank")
    }
  }

  const headerColor = category?.color || '#f97316'

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      {/* Category Header */}
      <div className="relative pt-28 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            background: `linear-gradient(135deg, ${headerColor}20 0%, ${headerColor}05 50%, transparent 100%)`
          }}
        />
        
        {/* Decorative blob */}
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-30"
          style={{ backgroundColor: headerColor }}
        />

        <div className="container mx-auto px-4 relative">
          <Button
            variant="ghost"
            className="mb-6 glass hover:bg-orange-500/10"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
          
          <div className="flex items-center gap-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${headerColor}30, ${headerColor}15)`,
                color: headerColor
              }}
            >
              {loading ? (
                <Skeleton className="w-12 h-12 rounded-xl" />
              ) : (
                category?.icon || category?.name.charAt(0)
              )}
            </div>
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-10 w-48 mb-2" />
                  <Skeleton className="h-6 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">{category?.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {category?.description || `浏览 ${websites.length} 个${category?.name}相关网站`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <p className="text-muted-foreground">
              共 <span className="font-medium text-foreground">{websites.length}</span> 个网站
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              disabled={loading}
              className="rounded-lg"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              disabled={loading}
              className="rounded-lg"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Websites */}
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="glass-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card flex items-center gap-4 p-4">
                  <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-20 hidden sm:block" />
                </Card>
              ))}
            </div>
          )
        ) : websites.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {websites.map((website) => (
                <Card
                  key={website.id}
                  className="group glass-card cursor-pointer hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  onClick={() => handleWebsiteClick(website.id, website.url)}
                >
                      <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 flex items-center justify-center shadow-inner">
                        <WebsiteIcon 
                          url={website.url} 
                          title={website.title} 
                          icon={website.icon}
                          size="lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                          {website.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {website.clickCount.toLocaleString()} 次访问
                        </p>
                      </div>
                    </div>
                    
                    {website.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {website.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                        {website.category.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:text-primary" />
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {websites.map((website) => (
                <Card
                  key={website.id}
                  className="group glass-card flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleWebsiteClick(website.id, website.url)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <WebsiteIcon 
                      url={website.url} 
                      title={website.title} 
                      icon={website.icon}
                      size="lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {website.title}
                    </h3>
                    {website.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {website.description}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                      {website.category.name}
                    </span>
                    <span>{website.clickCount.toLocaleString()} 次访问</span>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:text-primary" />
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无结果</h3>
            <p className="text-muted-foreground">
              该分类下还没有网站，稍后再来看看吧
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
