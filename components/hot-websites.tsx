"use client"

import { useState, useEffect } from "react"
import { ExternalLink, TrendingUp, Star, Loader2, Globe, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { WebsiteIcon } from "./website-icon"

interface Website {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  clickCount: number
  isFeatured: boolean
  category: {
    name: string
    color?: string
  }
  tags?: string
  createdAt: string
}

export function HotWebsites() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotWebsites()
  }, [])

  async function fetchHotWebsites() {
    try {
      const res = await fetch("/api/websites/hot")
      const data = await res.json()
      setWebsites(data.slice(0, 12))
    } catch (error) {
      console.error("Failed to fetch hot websites:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleWebsiteClick(websiteId: string, url: string) {
    try {
      await fetch(`/api/websites/${websiteId}/click`, {
        method: "POST",
      })
      window.open(url, "_blank")
    } catch (error) {
      console.error("Failed to record click:", error)
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    )
  }

  return null
}