"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Globe, Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCategories } from "./categories-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function Navbar() {
  const { categories, loading } = useCategories()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // 防止 hydration mismatch
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500" />
              <span className="text-xl font-bold">导航站</span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-lg shadow-black/5' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              导航站
            </span>
          </Link>

          {/* Desktop Navigation - 固定高度避免闪动 */}
          <nav className="hidden md:flex items-center gap-1 h-10">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-orange-500/10 hover:text-primary"
            >
              首页
            </Link>
            
            {loading ? (
              // 加载时显示骨架屏占位，保持宽度稳定
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-8 rounded-lg mx-1" />
              ))
            ) : (
              categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-orange-500/10 hover:text-primary whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))
            )}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-orange-500/10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Admin Link */}
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-lg border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50"
              >
                管理
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索网站..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-orange-500/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-8 rounded-lg" />
                ))
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-orange-500/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
