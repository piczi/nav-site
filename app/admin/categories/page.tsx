import { Metadata } from "next"
import { CategoriesManagement } from "./categories-management"

export const metadata: Metadata = {
  title: "分类管理 - 导航站点",
  description: "管理网站分类",
}

export default function CategoriesPage() {
  return <CategoriesManagement />
}
