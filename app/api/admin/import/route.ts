import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

// Middleware to check admin auth
async function checkAuth() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie?.value) {
    return false
  }
  return true
}

// 批量导入分类
async function importCategories(data: any[]) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel 行号（从2开始，因为第1行是标题）

    try {
      const { name, slug, description, icon, color, sort } = row

      // 验证必填字段
      if (!name || !slug) {
        results.failed++
        results.errors.push(`第 ${rowNum} 行: 名称和标识不能为空`)
        continue
      }

      // 检查 slug 是否已存在
      const existing = await prisma.category.findUnique({
        where: { slug },
      })

      if (existing) {
        results.failed++
        results.errors.push(`第 ${rowNum} 行: 标识 "${slug}" 已存在`)
        continue
      }

      await prisma.category.create({
        data: {
          name: String(name).trim(),
          slug: String(slug).trim(),
          description: description ? String(description).trim() : null,
          icon: icon ? String(icon).trim() : null,
          color: color ? String(color).trim() : null,
          sort: sort ? parseInt(String(sort)) || 0 : 0,
          isShow: true,
        },
      })

      results.success++
    } catch (error: any) {
      results.failed++
      results.errors.push(`第 ${rowNum} 行: ${error.message || "未知错误"}`)
    }
  }

  return results
}

// 批量导入网站
async function importWebsites(data: any[]) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel 行号（从2开始，因为第1行是标题）

    try {
      const { title, url, description, icon, categoryId, categorySlug, tags, isFeatured, isShow, sort } = row

      // 验证必填字段
      if (!title || !url) {
        results.failed++
        results.errors.push(`第 ${rowNum} 行: 名称和网址不能为空`)
        continue
      }

      // 验证 URL 格式
      try {
        new URL(url)
      } catch {
        results.failed++
        results.errors.push(`第 ${rowNum} 行: 网址格式不正确`)
        continue
      }

      // 确定分类 ID
      let finalCategoryId = categoryId

      if (!finalCategoryId && categorySlug) {
        // 通过 slug 查找分类
        const category = await prisma.category.findUnique({
          where: { slug: String(categorySlug).trim() },
        })
        if (category) {
          finalCategoryId = category.id
        }
      }

      if (!finalCategoryId) {
        // 尝试使用默认分类
        const defaultCategory = await prisma.category.findFirst({
          orderBy: { sort: 'asc' }
        })
        
        if (defaultCategory) {
          finalCategoryId = defaultCategory.id
          console.log(`第 ${rowNum} 行: 自动使用默认分类 "${defaultCategory.name}"`)
        } else {
          results.failed++
          results.errors.push(`第 ${rowNum} 行: 分类ID或分类标识不能为空。请先创建分类，或使用已有分类的slug`)
          continue
        }
      }

      // 验证分类是否存在
      const categoryExists = await prisma.category.findUnique({
        where: { id: finalCategoryId },
      })

      if (!categoryExists) {
        results.failed++
        results.errors.push(`第 ${rowNum} 行: 分类不存在`)
        continue
      }

      await prisma.website.create({
        data: {
          title: String(title).trim(),
          url: String(url).trim(),
          description: description ? String(description).trim() : null,
          icon: icon ? String(icon).trim() : null,
          categoryId: finalCategoryId,
          tags: tags ? String(tags).trim() : '',
          isFeatured: isFeatured === true || isFeatured === 'true' || isFeatured === 1 || isFeatured === '1',
          isShow: isShow !== false && isShow !== 'false' && isShow !== 0 && isShow !== '0',
          sort: sort ? parseInt(String(sort)) || 0 : 0,
          clickCount: 0,
        },
      })

      results.success++
    } catch (error: any) {
      results.failed++
      results.errors.push(`第 ${rowNum} 行: ${error.message || "未知错误"}`)
    }
  }

  return results
}

export async function POST(request: Request) {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json(
        { error: "请选择文件" },
        { status: 400 }
      )
    }

    if (!type || (type !== "websites" && type !== "categories")) {
      return NextResponse.json(
        { error: "无效的导入类型" },
        { status: 400 }
      )
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json(
        { error: "文件中没有数据" },
        { status: 400 }
      )
    }

    // 根据类型执行导入
    let results
    if (type === "categories") {
      results = await importCategories(data)
    } else {
      results = await importWebsites(data)
    }

    return NextResponse.json({
      imported: true,
      type,
      total: data.length,
      ...results,
    })
  } catch (error) {
    console.error("Error importing data:", error)
    return NextResponse.json(
      { error: "导入失败" },
      { status: 500 }
    )
  }
}

// 获取导入模板
export async function GET(request: Request) {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || (type !== "websites" && type !== "categories")) {
      return NextResponse.json(
        { error: "无效的模板类型" },
        { status: 400 }
      )
    }

    // 获取所有分类作为参考
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    })

    let templateData: any[] = []
    let headers: string[] = []
    
    // 获取示例分类（用于网站模板）
    const exampleCategory = categories[0]

    if (type === "categories") {
      headers = ["name", "slug", "description", "icon", "color", "sort"]
      templateData = [
        {
          name: "开发工具",
          slug: "dev-tools",
          description: "开发者常用工具",
          icon: "🛠️",
          color: "#3b82f6",
          sort: 0,
        },
        {
          name: "设计资源",
          slug: "design",
          description: "设计相关资源",
          icon: "🎨",
          color: "#ec4899",
          sort: 1,
        },
      ]
    } else {
      headers = ["title", "url", "description", "icon", "categorySlug", "tags", "isFeatured", "isShow", "sort"]
      
      // 如果没有现有分类，显示提示说明
      const hasCategories = categories.length > 0
      
      templateData = [
        {
          title: "Google",
          url: "https://www.google.com",
          description: "全球最大的搜索引擎",
          icon: "🔍",
          categorySlug: exampleCategory?.slug || "dev-tools",
          tags: "搜索,工具",
          isFeatured: true,
          isShow: true,
          sort: 0,
        },
        {
          title: "GitHub",
          url: "https://github.com",
          description: "代码托管平台",
          icon: "💻",
          categorySlug: exampleCategory?.slug || "dev-tools",
          tags: "代码,开源",
          isFeatured: false,
          isShow: true,
          sort: 1,
        },
      ]
      
      // 如果没有分类，在数据中添加说明
      if (!hasCategories) {
        templateData.unshift({
          _重要提示: "请先创建分类，或者直接在导入时使用分类的slug（英文标识）"
        } as any)
      }
    }

    // 创建 Excel 文件
    const worksheet = XLSX.utils.json_to_sheet(templateData, { header: headers })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "模板")
    
    // 为网站模板添加分类下拉框（仅当有分类时）
    if (type === "websites" && categories.length > 0) {
      // 获取 categorySlug 列的索引
      const categorySlugIndex = headers.indexOf("categorySlug")
      if (categorySlugIndex !== -1) {
        // 创建分类列表（用于下拉框）
        const categoryList = categories.map(c => c.slug)
        
        // 为数据行添加数据验证（从第2行开始，第1行是标题）
        const range = {
          s: { c: categorySlugIndex, r: 1 },  // 开始单元格（第2行）
          e: { c: categorySlugIndex, r: Math.max(templateData.length, 50) }  // 结束单元格（最多50行）
        }
        
        // 添加数据验证到下拉框
        if (!worksheet['!dataValidation']) {
          worksheet['!dataValidation'] = []
        }
        
        worksheet['!dataValidation'].push({
          sqref: XLSX.utils.encode_range(range),
          type: 'list',
          formula1: `"${categoryList.join(',')}"`,
          allowBlank: true,
          showDropDown: true
        })
      }
    }

    // 添加说明工作表
    const helpData = type === "categories" 
      ? [
          { 字段名: "name", 说明: "分类名称（必填）", 示例: "开发工具" },
          { 字段名: "slug", 说明: "URL标识，唯一（必填）", 示例: "dev-tools" },
          { 字段名: "description", 说明: "分类描述", 示例: "开发者常用工具" },
          { 字段名: "icon", 说明: "图标，支持 emoji 或图片 URL", 示例: "🛠️" },
          { 字段名: "color", 说明: "主题色，十六进制格式", 示例: "#3b82f6" },
          { 字段名: "sort", 说明: "排序数字，越小越靠前", 示例: "0" },
        ]
      : [
          { 字段名: "title", 说明: "网站名称（必填）", 示例: "Google" },
          { 字段名: "url", 说明: "网站链接（必填）", 示例: "https://www.google.com" },
          { 字段名: "description", 说明: "网站描述", 示例: "全球最大的搜索引擎" },
          { 字段名: "icon", 说明: "图标，支持 emoji 或图片 URL", 示例: "🔍" },
          { 字段名: "categoryId", 说明: `分类ID（必填，见下方可用分类）`, 示例: exampleCategory?.id || "" },
          { 字段名: "categorySlug", 说明: "分类标识（与categoryId二选一）", 示例: exampleCategory?.slug || "dev-tools" },
          { 字段名: "tags", 说明: "标签，用逗号分隔", 示例: "搜索,工具" },
          { 字段名: "isFeatured", 说明: "是否推荐：true/false", 示例: "true" },
          { 字段名: "isShow", 说明: "是否显示：true/false", 示例: "true" },
          { 字段名: "sort", 说明: "排序数字，越小越靠前", 示例: "0" },
        ]

    const helpSheet = XLSX.utils.json_to_sheet(helpData)
    XLSX.utils.book_append_sheet(workbook, helpSheet, "字段说明")

    // 如果导入网站，添加分类参考表
    if (type === "websites") {
      const categoriesSheet = XLSX.utils.json_to_sheet(categories.map(c => ({
        ID: c.id,
        名称: c.name,
        标识: c.slug,
      })))
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, "可用分类")
    }

    // 生成 Excel 文件 Buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // 返回文件
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_import_template.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error generating template:", error)
    return NextResponse.json(
      { error: "生成模板失败" },
      { status: 500 }
    )
  }
}
