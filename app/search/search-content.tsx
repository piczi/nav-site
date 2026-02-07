"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ArrowLeft, Filter, Grid3X3, List, ExternalLink, Star, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  clickCount: number
  isFeatured: boolean
  tags?: string[]
  category: {
    id: string
    name: string
    slug: string
    color?: string
  }
}

interface SearchFilters {
  category?: string
  sortBy: "relevance" | "Popular" | "newest"
  tab: "all" | "featured" | "hot" | "new" | "tags"
}

export function SearchContent({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(initialQuery)
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const initialTab = (searchParams.get('tab') as SearchFilters['tab']) || 'all'
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "relevance",
    tab: initialTab
  })

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("search", searchQuery)
      if (filters.category) params.set("category", filters.category)
      
      const res = await fetch(`/api/websites?${params.toString()}`)
      const data = await res.json()
      
      // Filter by tab first
      let filteredData = [...data]
      if (filters.tab === "featured") {
        filteredData = filteredData.filter(w => w.isFeatured)
      }
      
      // Then sort
      let sortedData = [...filteredData]
      if (filters.sortBy === "Popular") {
        sortedData.sort((a, b) => b.clickCount - a.clickCount)
      } else if (filters.tab === "new" || filters.sortBy === "newest") {
        // Sort by creation date for new websites
        sortedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      
      setWebsites(sortedData)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      performSearch(query.trim())
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索网站..."
                  className="pl-10 pr-20"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {loading ? "搜索中..." : "搜索"}
                </Button>
              </div>
            </form>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : websites.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                找到 <span className="font-medium text-foreground">{websites.length}</span> 个结果
              </p>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    setFilters({ ...filters, sortBy: e.target.value as any })
                    performSearch(query)
                  }}
                  className="text-sm border rounded-md px-2 py-1 bg-background"
                >
                  <option value="relevance">相关度</option>
                  <option value="popular">最受欢迎</option>
                </select>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {websites.map((website) => (
                  <Card
                    key={website.id}
                    className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleWebsiteClick(website.id, website.url)}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
                          {website.icon || website.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
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
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {website.category.name}
                        </span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {websites.map((website) => (
                  <Card
                    key={website.id}
                    className="group flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleWebsiteClick(website.id, website.url)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl flex-shrink-0">
                      {website.icon || website.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold group-hover:text-primary transition-colors">
                        {website.title}
                      </h3>
                      {website.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {website.description}
                        </p>
                      )}
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded-full bg-muted">
                        {website.category.name}
                      </span>
                      <span>{website.clickCount.toLocaleString()} 次访问</span>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">未找到相关结果</h3>
            <p className="text-muted-foreground">
              尝试使用其他关键词搜索
            </p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
