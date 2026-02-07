"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Globe, Star, Clock, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { WebsiteIcon } from "./website-icon"
import { useCategories } from "./categories-provider"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  _count?: {
    websites: number
  }
}

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  clickCount: number
  isFeatured: boolean
  category: {
    name: string
    slug: string
  }
  tags?: string
  createdAt: string
}

export function HomeContent() {
  const { categories, loading: categoriesLoading } = useCategories()
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    featuredOnly: false,
    sortBy: "clickCount" as "clickCount" | "createdAt",
    tags: "" as string
  })

  // 防抖搜索
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchWebsites()
  }, [activeCategory, debouncedSearchQuery, filters])

  async function fetchWebsites() {
    setLoading(true)
    try {
      let url = "/api/websites"
      const params = new URLSearchParams()
      
      if (activeCategory) {
        params.append("category", activeCategory)
      }
      
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery)
      }
      
      if (filters.featuredOnly) {
        params.append("featured", "true")
      }
      
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await fetch(url)
      const data = await res.json()
      setWebsites(data)
    } catch (error) {
      console.error("Failed to fetch websites:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleWebsiteClick(websiteId: string, url: string) {
    try {
      await fetch(`/api/websites/${websiteId}/click`, {
        method: "POST",
      })
      window.open(url, "_blank")
    } catch (error) {
      console.error("Failed to record click:", error)
      window.open(url, "_blank")
    }
  }

  const toggleFilter = (filter: keyof typeof filters) => {
    if (filter === 'featuredOnly') {
      setFilters(prev => ({ ...prev, featuredOnly: !prev.featuredOnly }))
    }
  }

  const clearAllFilters = () => {
    setFilters({
      featuredOnly: false,
      sortBy: "clickCount",
      tags: ""
    })
    setSearchQuery("")
    setActiveCategory(null)
  }

  // 过滤掉没有网站的分类
  const validCategories = categories.filter(cat => 
    cat._count?.websites && cat._count.websites > 0
  )

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8 md:pt-28">
        {/* 分类和搜索区域 */}
        <div className="mb-6">
          {/* 分类切换 Tab */}
          <div className="relative mb-4">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              <Button
                variant={activeCategory ? "outline" : "default"}
                size="sm"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                onClick={() => setActiveCategory(null)}
              >
                全部
              </Button>
              
              {validCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  className="rounded-full whitespace-nowrap min-w-[60px] flex-shrink-0"
                  onClick={() => setActiveCategory(activeCategory === category.slug ? null : category.slug)}
                >
                  {category.name}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3 w-3 mr-1" />
                筛选
              </Button>
            </div>
            
            {/* 滚动指示器 - 只在有足够多分类时显示 */}
            {validCategories.length > 6 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />
            )}
          </div>

          {/* 搜索框 - 更简洁的位置 */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索网站、描述或标签..."
              className="pl-10 pr-10 py-2 text-sm glass-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* 高级筛选面板 */}
        {showFilters && (
          <div className="mb-6 p-4 glass-card rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featuredOnly}
                    onChange={() => toggleFilter('featuredOnly')}
                    className="w-4 h-4"
                  />
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm">仅推荐</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">排序:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      sortBy: e.target.value as any 
                    }))}
                    className="text-sm border rounded px-2 py-1 bg-background"
                  >
                    <option value="clickCount">热门度</option>
                    <option value="createdAt">最新</option>
                  </select>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm"
              >
                清除筛选
              </Button>
            </div>
          </div>
        )}

        {/* 结果统计 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            找到 <span className="font-medium text-foreground">{websites.length}</span> 个网站
            {activeCategory && (
              <span> · {validCategories.find(c => c.slug === activeCategory)?.name}</span>
            )}
          </p>
          
          {websites.length > 0 && (
            <Link href="/search" className="text-sm text-primary hover:underline">
              高级搜索 →
            </Link>
          )}
        </div>

        {/* 网站列表 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : websites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {websites.map((website) => {
              const tags = website.tags?.split(',').filter(t => t.trim()) || []
              return (
                <Card
                  key={website.id}
                  className="group glass-card p-4 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => handleWebsiteClick(website.id, website.url)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 flex items-center justify-center shadow-inner">
                      <WebsiteIcon 
                        url={website.url} 
                        title={website.title} 
                        icon={website.icon}
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {website.title}
                        </h3>
                        {website.isFeatured && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{website.category.name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {website.clickCount.toLocaleString()}
                        </span>
                      </div>
                      
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到相关网站</h3>
            <p className="text-muted-foreground">
              尝试调整搜索关键词或筛选条件
            </p>
          </div>
        )}
      </main>
    </div>
  )
}