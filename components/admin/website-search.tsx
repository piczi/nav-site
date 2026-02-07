"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WebsiteSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  featuredOnly: boolean
  onFeaturedOnlyChange: (featured: boolean) => void
  categories: { id: string; name: string }[]
  onClearFilters: () => void
}

export function WebsiteSearch({ 
  searchQuery, 
  onSearchChange, 
  categoryFilter, 
  onCategoryFilterChange,
  featuredOnly,
  onFeaturedOnlyChange,
  categories,
  onClearFilters
}: WebsiteSearchProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索网站名称或描述..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="所有分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">所有分类</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => onFeaturedOnlyChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">仅推荐</span>
        </label>

        {(searchQuery || categoryFilter || featuredOnly) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            清除筛选
          </Button>
        )}
      </div>
    </div>
  )
}