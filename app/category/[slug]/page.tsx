import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryContent } from "./category-content"

export const metadata: Metadata = {
  title: "分类浏览 - 导航站点",
  description: "按分类浏览优质网站",
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  if (!slug) {
    notFound()
  }

  return <CategoryContent slug={slug} />
}