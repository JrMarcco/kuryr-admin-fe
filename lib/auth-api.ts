import { api, type ApiResponse } from "./api"

interface LoginRequest {
  Username: string
  Password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    name: string
  }
}

export const authApi = {
  // 登录
  async login(credentials: LoginRequest): Promise<ApiResponse<string>> {
    const response = await api.post<string>("/v1/user/login", credentials, false)

    if (response.success && response.data) {
      // 保存登录信息
      localStorage.setItem("jwt-token", response.data)
      localStorage.setItem("username", credentials.Username)
      localStorage.setItem("isLoggedIn", "true")
    }

    return response
  },

  // 登出
  logout(): void {
    localStorage.removeItem("jwt-token")
    localStorage.removeItem("username")
    localStorage.removeItem("isLoggedIn")
  },

  // 检查登录状态
  isLoggedIn(): boolean {
    const token = localStorage.getItem("jwt-token")
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    return !!(token && isLoggedIn === "true")
  },

  // 获取当前用户信息
  getCurrentUser(): { username: string } | null {
    const username = localStorage.getItem("username")
    return username ? { username } : null
  },
}
