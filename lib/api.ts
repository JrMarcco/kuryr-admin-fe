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
  private baseURL = ""

  constructor(baseURL = "") {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("jwt-token")
    return token ? { "x-jwt-token": token } : {}
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data.Data || data.data || data,
          message: data.message || "操作成功",
        }
      } else {
        // 处理认证失败
        if (response.status === 401) {
          localStorage.removeItem("jwt-token")
          localStorage.removeItem("isLoggedIn")
          localStorage.removeItem("username")
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
      return await this.handleResponse<T>(response)
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
