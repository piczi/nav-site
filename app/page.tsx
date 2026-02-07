import { Metadata } from "next"
import { HomeContent } from "@/components/home-content"

export const metadata: Metadata = {
  title: "导航站点 - 发现优质网站",
  description: "收录国内外知名网站，提供快捷的网址导航服务",
}

export default function HomePage() {
  return <HomeContent />
}
