"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Globe, 
  FolderTree,
  LogOut 
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/check-auth")
      if (!res.ok) {
        setAuthenticated(false)
        router.push("/admin")
        return
      }
      const data = await res.json()
      if (data.authenticated) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
        router.push("/admin")
      }
    } catch (error) {
      setAuthenticated(false)
      router.push("/admin")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:block">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">导航网站管理</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
            <LayoutDashboard className="h-4 w-4" />
            <span>仪表盘</span>
          </Link>
          <Link href="/admin/websites" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
            <Globe className="h-4 w-4" />
            <span>网站管理</span>
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
            <FolderTree className="h-4 w-4" />
            <span>分类管理</span>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" })
              router.push("/admin")
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>退出登录</span>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}