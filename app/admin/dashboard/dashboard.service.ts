export interface DashboardStats {
  totalWebsites: number
  totalCategories: number
  totalClicks: number
  featuredWebsites: number
}

export class UnauthorizedError extends Error {
  override name = "UnauthorizedError"
  constructor(message = "Unauthorized") {
    super(message)
  }
}

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function ensureJsonObjectArray(value: unknown, label: string): JsonObject[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} response is not an array`)
  }
  if (!value.every(isJsonObject)) {
    throw new Error(`${label} response contains non-object items`)
  }
  return value
}

function getNumberField(obj: JsonObject, key: string): number | undefined {
  const v = obj[key]
  return typeof v === "number" && Number.isFinite(v) ? v : undefined
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [websitesRes, categoriesRes] = await Promise.all([
    fetch("/api/admin/websites", {
      method: "GET",
      // 移除 credentials: "include"
      cache: "no-store",
    }),
    fetch("/api/admin/categories", {
      method: "GET",
      // 移除 credentials: "include"
      cache: "no-store",
    }),
  ])

  if (websitesRes.status === 401 || categoriesRes.status === 401) {
    throw new UnauthorizedError()
  }

  if (!websitesRes.ok) {
    throw new Error(`Failed to fetch websites: ${websitesRes.status}`)
  }
  if (!categoriesRes.ok) {
    throw new Error(`Failed to fetch categories: ${categoriesRes.status}`)
  }

  const websitesRaw: unknown = await websitesRes.json()
  const categoriesRaw: unknown = await categoriesRes.json()

  const websites = ensureJsonObjectArray(websitesRaw, "websites")
  const categories = ensureJsonObjectArray(categoriesRaw, "categories")

  let totalClicks = 0
  let featuredWebsites = 0

  for (const w of websites) {
    totalClicks += getNumberField(w, "clickCount") ?? 0
    if (w.isFeatured === true) {
      featuredWebsites += 1
    }
  }

  return {
    totalWebsites: websites.length,
    totalCategories: categories.length,
    totalClicks,
    featuredWebsites,
  }
}

export async function logoutAdmin(): Promise<void> {
  const res = await fetch("/api/admin/logout", {
    method: "POST",
    // 移除 credentials: "include"
    cache: "no-store",
  })
  // 即便后端返回 401/500，这里也不阻止前端跳转到登录页
  if (!res.ok && res.status !== 401) {
    // 让调用方决定是否提示；这里只做轻量抛错
    throw new Error(`Logout failed: ${res.status}`)
  }
}
