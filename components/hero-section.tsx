"use client"

import { useState } from "react"
import { Search, Sparkles, TrendingUp, ArrowRight, Globe, Star, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

type TabType = 'all' | 'featured' | 'hot' | 'new' | 'tags'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [showSearch, setShowSearch] = useState(false)

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: '全部', icon: <Globe className="h-4 w-4" /> },
    { id: 'featured', label: '推荐', icon: <Star className="h-4 w-4" /> },
    { id: 'hot', label: '热门', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'new', label: '最新', icon: <Clock className="h-4 w-4" /> },
    { id: 'tags', label: '标签', icon: <Tag className="h-4 w-4" /> },
  ]

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 根据当前 tab 构建搜索 URL
      const searchParams = new URLSearchParams()
      searchParams.set('q', searchQuery.trim())
      searchParams.set('tab', activeTab)
      window.location.href = `/search?${searchParams.toString()}`
    }
  }

  return (
    <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-tr from-red-300/15 to-orange-300/15 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-amber-200/15 to-yellow-200/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-5 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6 text-orange-600 dark:text-orange-400">
            <Sparkles className="h-4 w-4" />
            <span>收录 1000+ 优质网站</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">发现</span>
            <span className="text-gradient">优质网站</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            精心收录国内外最实用的网站和工具，让你的上网体验更高效
          </p>

          {/* Compact Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索网站、分类或标签..."
                  className="pl-10 h-12 glass-card border-0 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                />
              </div>
              <Button
                type="submit"
                onClick={handleSearch}
                className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
              >
                搜索
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex flex-wrap justify-center gap-2 p-1 bg-muted/30 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-800 dark:text-orange-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/categories"
              className="px-4 py-2 rounded-lg glass hover:bg-orange-500/10 transition-all"
            >
              浏览分类
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 rounded-lg glass hover:bg-orange-500/10 transition-all"
            >
              高级搜索
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg glass hover:bg-orange-500/10 transition-all"
            >
              后台管理
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
