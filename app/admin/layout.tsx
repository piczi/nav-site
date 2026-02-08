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
  Loader2
} from "lucide-react"
import { adminLogout, checkAdminAuthenticated } from "./admin-auth.service"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

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
            // 直接重定向到登录页
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

  // 未认证时直接重定向，不显示错误界面
  if (!authenticated) {
    return null
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
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
