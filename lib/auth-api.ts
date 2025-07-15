import { api, type ApiResponse } from "./api"

interface LoginRequest {
  Username: string
  Password: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export const authApi = {
  // 登录
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const response = await api.post<TokenResponse>("/v1/user/login", credentials, false)

    if (response.success && response.data) {
      // 保存登录信息
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("username", credentials.Username)
      localStorage.setItem("isLoggedIn", "true")
    }

    return response
  },

  // 登出
  logout(): void {
    localStorage.removeItem("access-token")
    localStorage.removeItem("refresh-token")
    localStorage.removeItem("username")
    localStorage.removeItem("isLoggedIn")
  },

  // 检查登录状态
  isLoggedIn(): boolean {
    const token = localStorage.getItem("access-token")
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    return !!(token && isLoggedIn === "true")
  },

  // 获取当前用户信息
  getCurrentUser(): { username: string } | null {
    const username = localStorage.getItem("username")
    return username ? { username } : null
  },

  async refreshToken(): Promise<ApiResponse<TokenResponse>> {
    const refreshToken = localStorage.getItem("refresh-token")
    if (!refreshToken) {
      return { success: false, message: "No refresh token found" }
    }

    const response = await api.post<TokenResponse>(
      "/v1/user/refresh_token",
      { refresh_token: refreshToken },
      false,
    )

    if (response.success && response.data) {
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("isLoggedIn", "true")
    } else {
      // Refresh token failed, logout user
      this.logout()
    }

    return response
  },
}
