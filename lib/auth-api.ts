import { api, type ApiResponse } from "./api"

interface LoginRequest {
  Username: string
  Password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
}

export const authApi = {
  // 登录
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>("/v1/user/login", credentials, false)

    if (response.code === 200 && response.data) {
      // 保存登录信息
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("username", credentials.Username)
      localStorage.setItem("isLoggedIn", "true")

      return {
        code: 200,
        msg: "登录成功",
        data: response.data,
      }
    }

    return response
  },

  // 登出
  async logout(): Promise<void> {
    try {
      // 调用后端登出接口
      const response = await api.get("/v1/user/logout", true)

      if (response.code === 200) {
        console.log("服务端登出成功")
      } else {
        console.warn("服务端登出失败:", response.msg)
      }
    } catch (error) {
      console.error("调用登出接口失败:", error)
    } finally {
      // 无论服务端登出是否成功，都清除本地存储
      this.clearLocalStorage()
    }
  },

  // 清除本地存储
  clearLocalStorage(): void {
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

  // 刷新token
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem("refresh-token")
    if (!refreshToken) {
      return {
        code: 400,
        msg: "No refresh token found",
      }
    }

    const response = await api.post<LoginResponse>("/v1/user/refresh_token", { refresh_token: refreshToken }, false)

    if (response.code === 200 && response.data) {
      // 更新本地存储的token
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("isLoggedIn", "true")

      return {
        code: 200,
        msg: "Token刷新成功",
        data: response.data,
      }
    } else {
      // Refresh token failed, clear local storage
      this.clearLocalStorage()
    }

    return response
  },
}
