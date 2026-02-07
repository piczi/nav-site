// 安全配置
const SECURITY_CONFIG = {
  // 登录失败最大次数
  MAX_LOGIN_ATTEMPTS: 5,
  // 封禁时间（分钟）
  BAN_DURATION: 30,
  // 请求频率限制（每分钟最大请求数）
  // 本地开发环境禁用频率限制以避免 429 错误
  RATE_LIMIT_PER_MINUTE: process.env.NODE_ENV === 'production' ? 10 : 1000,
}

// 内存存储（生产环境应使用 Redis）
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const bannedIPs = new Map<string, number>() // IP -> 解封时间戳
const requestCounts = new Map<string, { count: number; windowStart: number }>()

/**
 * 检查 IP 是否被封禁
 */
export function isIPBanned(ip: string): boolean {
  const banTime = bannedIPs.get(ip)
  if (!banTime) return false
  
  const now = Date.now()
  if (now >= banTime) {
    // 解封
    bannedIPs.delete(ip)
    loginAttempts.delete(ip)
    return false
  }
  
  return true
}

/**
 * 记录登录失败
 */
export function recordLoginFailure(ip: string): void {
  const now = Date.now()
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
  } else {
    const attempts = loginAttempts.get(ip)!
    if (now - attempts.lastAttempt > 30 * 60 * 1000) {
      // 超过30分钟，重置计数
      loginAttempts.set(ip, { count: 1, lastAttempt: now })
    } else {
      loginAttempts.set(ip, { 
        count: attempts.count + 1, 
        lastAttempt: now 
      })
    }
  }
  
  // 检查是否达到封禁阈值
  const attempts = loginAttempts.get(ip)!
  if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const banUntil = now + SECURITY_CONFIG.BAN_DURATION * 60 * 1000
    bannedIPs.set(ip, banUntil)
  }
}

/**
 * 检查请求频率限制
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowSize = 60 * 1000 // 1 minute
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, windowStart: now })
    return true
  }
  
  const ipData = requestCounts.get(ip)!
  
  // 如果窗口已过期，重置计数
  if (now - ipData.windowStart > windowSize) {
    requestCounts.set(ip, { count: 1, windowStart: now })
    return true
  }
  
  // 检查是否超过限制
  if (ipData.count >= SECURITY_CONFIG.RATE_LIMIT_PER_MINUTE) {
    return false
  }
  
  // 增加计数
  requestCounts.set(ip, { 
    count: ipData.count + 1, 
    windowStart: ipData.windowStart 
  })
  
  return true
}

/**
 * 清理过期数据（定期调用）
 */
export function cleanupExpiredData(): void {
  const now = Date.now()
  
  // 清理过期的请求计数
  const requestCountKeys = Array.from(requestCounts.keys())
  for (const ip of requestCountKeys) {
    const data = requestCounts.get(ip)
    if (data && now - data.windowStart > 60 * 1000) {
      requestCounts.delete(ip)
    }
  }
  
  // 清理过期的登录尝试（保留最近30分钟的数据）
  const loginAttemptKeys = Array.from(loginAttempts.keys())
  for (const ip of loginAttemptKeys) {
    const data = loginAttempts.get(ip)
    if (data && now - data.lastAttempt > 30 * 60 * 1000) {
      loginAttempts.delete(ip)
    }
  }
}

// 定期清理过期数据
setInterval(cleanupExpiredData, 30 * 1000) // 每30秒清理一次

export { SECURITY_CONFIG }