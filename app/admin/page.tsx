import { Metadata } from "next"
import { AdminLogin } from "./admin-login"

export const metadata: Metadata = {
  title: "后台管理 - 导航站点",
  description: "管理网站和分类",
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <AdminLogin />
    </div>
  )
}
