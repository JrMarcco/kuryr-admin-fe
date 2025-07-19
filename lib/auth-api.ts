import {api, type ApiResponse} from "./api"

interface PasswordLoginRequest {
  account: string
  password: string
  type: "mobile" | "email"
}

interface CodeLoginRequest {
  account: string
  code: string
  type: "mobile" | "email"
}

interface SendCodeRequest {
  account: string
  type: "mobile" | "email"
}

interface LoginResponse {
  access_token: string
  refresh_token: string
}

export const authApi = {
  // 密码登录
  async loginWithPassword(credentials: PasswordLoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>(
      "/v1/user/login",
      {
        VerifyType: "passwd",
        AccountType: credentials.type,
        Account: credentials.account,
        Credential: credentials.password,
      },
      false,
    )

    // noinspection DuplicatedCode
    if (response.code === 200 && response.data) {
      // 保存登录信息
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("username", credentials.account)
      localStorage.setItem("isLoggedIn", "true")

      return {
        code: 200,
        msg: "登录成功",
        data: response.data,
      }
    }

    return response
  },

  // 验证码登录
  async loginWithCode(credentials: CodeLoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>(
      "/v1/user/login",
      {
        VerifyType: "code",
        AccountType: credentials.type,
        Account: credentials.account,
        Credential: credentials.code,
      },
      false,
    )

    // noinspection DuplicatedCode
    if (response.code === 200 && response.data) {
      // 保存登录信息
      localStorage.setItem("access-token", response.data.access_token)
      localStorage.setItem("refresh-token", response.data.refresh_token)
      localStorage.setItem("isLoggedIn", "true")

      return {
        code: 200,
        msg: "登录成功",
        data: response.data,
      }
    }

    return response
  },

  // 发送验证码
  async sendVerificationCode(request: SendCodeRequest): Promise<ApiResponse<null>> {
    return await api.post<null>(
      "/v1/user/send_code",
      {
        Account: request.account,
        AccountType: request.type,
      },
      false,
    )
  },

  // 登出
  async logout(): Promise<void> {
    try {
      // 获取当前的 access token
      const accessToken = localStorage.getItem("access-token")

      if (accessToken) {
        const response = await api.request("/v1/user/logout", {
          method: "GET",
          requireAuth: true,
          headers: { "x-access-token": accessToken }
        })

        if (response.code === 200) {
          console.log("服务端登出成功")
        } else {
          console.warn("服务端登出失败:", response.msg)
        }
      } else {
        console.warn("未找到 access token，跳过服务端登出")
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
