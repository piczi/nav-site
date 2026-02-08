"use client"

import { useState, useEffect } from "react"

interface WebsiteIconProps {
  url: string
  title: string
  icon?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-12 h-12 text-lg",
}

// 构建 favicon URL
const getFaviconUrl = (url: string): string => {
  return `/api/favicon?url=${encodeURIComponent(url)}&t=${Math.floor(Date.now() / 3600000)}` // 每小时刷新一次
}

export function WebsiteIcon({ url, title, icon, size = "md", className = "" }: WebsiteIconProps) {
  const hasIcon = typeof icon === "string" && icon.trim().length > 0
  const proxyUrl = getFaviconUrl(url)

  type IconSource = "icon" | "proxy" | "fallback"
  const [source, setSource] = useState<IconSource>(hasIcon ? "icon" : "proxy")

  useEffect(() => {
    setSource(hasIcon ? "icon" : "proxy")
  }, [hasIcon, url])

  const src = source === "icon" ? icon! : proxyUrl

  const handleError = () => {
    setSource((prev) => {
      if (prev === "icon") return "proxy"
      if (prev === "proxy") return "fallback"
      return "fallback"
    })
  }

  if (source === "fallback") {
    return (
      <span className={`${sizeClasses[size]} flex items-center justify-center font-bold text-gradient ${className}`}>
        {title.charAt(0).toUpperCase()}
      </span>
    )
  }
  
  return (
    <img
      key={src}
      src={src}
      alt={title}
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={handleError}
    />
  )
}
