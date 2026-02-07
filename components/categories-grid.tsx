"use client"

import { Grid3X3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCategories, Category } from "./categories-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoriesGrid() {
  const { categories, loading } = useCategories()

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-400/10 to-orange-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Grid3X3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">分类浏览</h2>
              <p className="text-sm text-muted-foreground">按类别快速找到你需要的网站</p>
            </div>
          </div>
          <Link href="/categories">
            <Button variant="ghost" className="rounded-xl glass hover:bg-orange-500/10 group">
              查看全部
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Categories Grid - Simplified for category page only */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-card p-6 h-full">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((category) => {
              const color = category.color || '#f97316'
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group glass-card p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer h-full hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                          color: color
                        }}
                      >
                        {category.icon || category.name.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category._count?.websites || 0} 个网站
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
