import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化Unix毫秒时间戳为 yyyy/MM/dd HH:mm:ss 格式
 * @param timestamp Unix毫秒时间戳
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number): string {
  if (!timestamp || !isValidTimestamp(timestamp)) {
    return "-"
  }

  try {
    // 确保是毫秒时间戳
    const date = new Date(timestamp)

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return "-"
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "-"
  }
}

/**
 * 验证时间戳是否有效
 * @param timestamp Unix毫秒时间戳
 * @returns 是否为有效时间戳
 */
export function isValidTimestamp(timestamp: number): boolean {
  // 检查是否为数字且大于0
  if (!timestamp || isNaN(timestamp) || !isFinite(timestamp) || timestamp <= 0) {
    return false
  }

  // 检查是否在合理的时间范围内（1970年到2100年）
  const minTimestamp = 0 // 1970-01-01
  const maxTimestamp = 4102444800000 // 2100-01-01

  return timestamp >= minTimestamp && timestamp <= maxTimestamp
}

/**
 * 获取当前Unix毫秒时间戳
 * @returns 当前时间的毫秒时间戳
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}
