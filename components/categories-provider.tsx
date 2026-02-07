"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  _count?: {
    websites: number
  }
}

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查 sessionStorage 中是否有缓存的分类数据
    const cached = sessionStorage.getItem('nav_categories')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        // 确保缓存的是数组
        if (Array.isArray(parsed)) {
          setCategories(parsed)
          setLoading(false)
        }
      } catch {
        // 解析失败，重新获取
      }
    }

    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      
      // 确保返回的是数组
      if (Array.isArray(data)) {
        setCategories(data)
        // 缓存到 sessionStorage
        sessionStorage.setItem('nav_categories', JSON.stringify(data))
      } else {
        console.error("Categories API returned non-array:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <CategoriesContext.Provider value={{ categories, loading }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
