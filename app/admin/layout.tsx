"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Globe,
  FolderTree,
  LogOut,
  ExternalLink,
  Loader2,
  BarChart3,
  Menu,
  X
} from "lucide-react"
import { adminLogout, checkAdminAuthenticated } from "./admin-auth.service"
import { AdminLogin } from "./admin-login"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // 登录页不进行认证检查
    if (pathname === "/admin") {
      setLoading(false);
      setAuthChecked(true);
      setAuthenticated(false);
      return;
    }

    // 对于管理后台页面，检查认证状态
    let isMounted = true;

    ;(async () => {
      try {
        const ok = await checkAdminAuthenticated();
        if (isMounted) {
          setAuthenticated(ok);
          setAuthChecked(true);
          setLoading(false);

          if (!ok) {
            router.replace("/admin");
          }
        }
      } catch (error) {
        if (isMounted) {
          setAuthenticated(false);
          setAuthChecked(true);
          setLoading(false);
          router.replace("/admin");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // 加载中显示 loading
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // 未认证时显示登录页
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AdminLogin />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed left-0 top-0 z-50 h-16 w-full border-b bg-card flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">管理后台</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r">
            <div className="flex h-16 items-center justify-between border-b px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">管理后台</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  仪表盘
                </Button>
              </Link>
              <Link href="/admin/websites" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname.startsWith("/admin/websites") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  网站管理
                </Button>
              </Link>
              <Link href="/admin/categories" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname.startsWith("/admin/categories") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FolderTree className="mr-2 h-4 w-4" />
                  分类管理
                </Button>
              </Link>
              <Link href="/admin/favicon-stats" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname.startsWith("/admin/favicon-stats") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  图标统计
                </Button>
              </Link>
            </nav>
            <div className="border-t p-4 space-y-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  查看前台
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  try {
                    await adminLogout()
                  } catch (error) {
                    console.error("Logout failed:", error)
                  }
                  router.push("/admin")
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
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
              <Button
                variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                仪表盘
              </Button>
            </Link>
            <Link href="/admin/websites">
              <Button
                variant={pathname.startsWith("/admin/websites") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Globe className="mr-2 h-4 w-4" />
                网站管理
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button
                variant={pathname.startsWith("/admin/categories") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <FolderTree className="mr-2 h-4 w-4" />
                分类管理
              </Button>
            </Link>
            <Link href="/admin/favicon-stats">
              <Button
                variant={pathname.startsWith("/admin/favicon-stats") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                图标统计
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
                try {
                  await adminLogout()
                } catch (error) {
                  console.error("Logout failed:", error)
                }
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
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
