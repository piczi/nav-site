"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Edit, Trash2, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WebsiteIcon } from "@/components/website-icon"

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  categoryId: string
  isFeatured: boolean
  isShow: boolean
  clickCount: number
  category: {
    name: string
  }
}

interface WebsiteListProps {
  websites: Website[]
  loading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleFeatured: (id: string, isFeatured: boolean) => void
  onWebsiteClick: (websiteId: string, url: string) => void
}

export function WebsiteList({ 
  websites, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleFeatured,
  onWebsiteClick 
}: WebsiteListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {websites.map((website) => (
        <Card key={website.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 flex items-center justify-center shadow-inner">
              <WebsiteIcon 
                url={website.url} 
                title={website.title} 
                icon={website.icon}
                size="lg"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                  {website.title}
                </h3>
                {website.isFeatured && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {website.description || '暂无描述'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{website.category.name}</span>
                <span>点击: {website.clickCount.toLocaleString()}</span>
                <span>{website.isShow ? '显示' : '隐藏'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onWebsiteClick(website.id, website.url)
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(website.id)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(website.id)
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}