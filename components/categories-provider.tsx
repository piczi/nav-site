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
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      // 添加时间戳防止缓存
      const res = await fetch(`/api/categories?t=${Date.now()}`)
      const data = await res.json()
      
      // 确保返回的是数组
      if (Array.isArray(data)) {
        setCategories(data)
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
