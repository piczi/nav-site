"use client"

import { useState } from "react"

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

export function WebsiteIcon({ url, title, icon, size = "md", className = "" }: WebsiteIconProps) {
  const [error, setError] = useState(false)
  
  // 如果提供了 icon 且没有错误，显示提供的 icon
  if (icon && !error) {
    return (
      <img
        src={icon}
        alt={title}
        className={`${sizeClasses[size]} object-contain ${className}`}
        onError={() => setError(true)}
      />
    )
  }
  
  // 尝试从 URL 获取域名
  let domain = ""
  try {
    const urlObj = new URL(url)
    domain = urlObj.hostname.replace(/^www\./, "")
  } catch {
    // URL 解析失败，显示首字母
    return (
      <span className={`${sizeClasses[size]} flex items-center justify-center font-bold text-gradient ${className}`}>
        {title.charAt(0).toUpperCase()}
      </span>
    )
  }
  
  // 使用 Google Favicon API 获取图标
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  
  if (!error) {
    return (
      <img
        src={googleFaviconUrl}
        alt={title}
        className={`${sizeClasses[size]} object-contain ${className}`}
        onError={() => setError(true)}
      />
    )
  }
  
  // 获取失败，显示首字母
  return (
    <span className={`${sizeClasses[size]} flex items-center justify-center font-bold text-gradient ${className}`}>
      {title.charAt(0).toUpperCase()}
    </span>
  )
}
