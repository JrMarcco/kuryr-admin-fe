import { authApi } from "./auth-api"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

class ApiClient {
  private readonly baseURL: string
  private isRefreshing = false

  constructor(baseURL = "") {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): { "x-access-token": string } | {} {
    const token = localStorage.getItem("access-token")
    return token ? { "x-access-token": token } : {}
  }

  private async handleResponse<T>(
    response: Response,
    endpoint: string,
    options: RequestOptions,
  ): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data.data || data.data || data,
          message: data.message || "操作成功",
        }
      } else {
        // 处理认证失败
        if (response.status === 401 && endpoint !== "/v1/user/refresh_token") {
          if (!this.isRefreshing) {
            this.isRefreshing = true
            const refreshResponse = await authApi.refreshToken()
            this.isRefreshing = false

            if (refreshResponse.success) {
              // 重新发起原始请求
              return this.request<T>(endpoint, options)
            }
          }

          // 如果刷新失败或正在刷新中，则登出
          authApi.logout()
          window.location.href = "/"
          return {
            success: false,
            message: "登录已过期，请重新登录",
          }
        }

        return {
          success: false,
          message: data.message || data.error || `请求失败 (${response.status})`,
          code: response.status,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "响应解析失败",
      }
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, requireAuth = true } = options

    try {
      const url = `${this.baseURL}${endpoint}`

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      }

      // 添加认证头
      if (requireAuth) {
        Object.assign(requestHeaders, this.getAuthHeaders())
      }

      const config: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (body && method !== "GET") {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(url, config)
      return await this.handleResponse<T>(response, endpoint, options)
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        message: "网络错误，请检查网络连接",
      }
    }
  }

  // 便捷方法
  async get<T = any>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requireAuth })
  }

  async post<T = any>(endpoint: string, body?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, requireAuth })
  }

  async put<T = any>(endpoint: string, body?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, requireAuth })
  }

  async delete<T = any>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requireAuth })
  }
}

// 创建API客户端实例
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
export const api = new ApiClient(baseURL)

// 导出类型
export type { ApiResponse }
