import { Metadata } from "next"
import { Suspense } from "react"
import { SearchContent } from "./search-content"

export const metadata: Metadata = {
  title: "搜索结果 - 导航站点",
  description: "搜索你需要的网站和资源",
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div>加载中...</div>}>
        <SearchContent initialQuery={query} />
      </Suspense>
    </div>
  )
}
