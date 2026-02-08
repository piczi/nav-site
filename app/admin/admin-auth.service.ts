export class AdminAuthError extends Error {
  override name = "AdminAuthError"
  constructor(message = "Admin authentication failed") {
    super(message)
  }
}

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// 缓存认证状态，避免重复请求
let authCache: { value: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5秒缓存

export async function checkAdminAuthenticated(): Promise<boolean> {
  // 检查缓存
  if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
    return authCache.value;
  }
  
  const res = await fetch("/api/admin/check-auth", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (res.status === 401) return false
  if (!res.ok) {
    throw new AdminAuthError(`Auth check failed: ${res.status}`)
  }

  const raw: unknown = await res.json()
  if (!isJsonObject(raw)) {
    throw new AdminAuthError("Auth check response is not an object")
  }

  const result = raw.authenticated === true;
  // 更新缓存
  authCache = { value: result, timestamp: Date.now() };
  return result
}

export async function adminLogout(): Promise<void> {
  const res = await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })

  // 允许后端把会话清理失败/已过期等情况也视为"前端登出完成"
  if (!res.ok && res.status !== 401) {
    throw new Error(`Logout failed: ${res.status}`)
  }
}
