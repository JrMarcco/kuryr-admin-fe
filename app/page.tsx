"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Mail, Phone } from "lucide-react"
import { authApi } from "@/lib/auth-api"

type LoginMethod = "password" | "code"
type AccountType = "mobile" | "email"

export default function LoginPage() {
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")
  const [accountType, setAccountType] = useState<AccountType>("mobile")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  // 倒计时效果
  useEffect(() => {
    let timer: number
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // 自动检测账号类型
  const handleAccountChange = (value: string) => {
    setAccount(value)
    // 简单的邮箱和手机号检测
    if (value.includes("@")) {
      setAccountType("email")
    } else if (/^\d+$/.test(value)) {
      setAccountType("mobile")
    }
  }

  // 发送验证码
  const handleSendCode = async () => {
    if (!account.trim()) {
      setError("请输入手机号或邮箱")
      return
    }

    // 验证格式
    if (accountType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) {
      setError("请输入正确的邮箱格式")
      return
    }

    if (accountType === "mobile" && !/^1[3-9]\d{9}$/.test(account)) {
      setError("请输入正确的手机号格式")
      return
    }

    setSendingCode(true)
    setError("")

    try {
      const response = await authApi.sendVerificationCode({
        account,
        type: accountType,
      })

      if (response.code === 200) {
        setCountdown(60) // 开始60秒倒计时
        setError("")
      } else {
        setError(response.msg || "发送验证码失败")
      }
    } catch (error) {
      console.error("Send code error:", error)
      setError("发送验证码失败，请稍后重试")
    } finally {
      setSendingCode(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let response

      if (loginMethod === "password") {
        response = await authApi.loginWithPassword({
          account,
          password,
          type: accountType,
        })
      } else {
        response = await authApi.loginWithCode({
          account,
          code: verificationCode,
          type: accountType,
        })
      }

      if (response.code === 200) {
        router.push("/dashboard")
      } else {
        setError(response.msg || "登录失败，请检查输入信息")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 测试账号处理函数
  const handleTestLogin = () => {
    setAccount("admin@test.com")
    setPassword("123456")
    setLoginMethod("password")
  }

  const handleQuickTestLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await authApi.loginWithPassword({
        account: "admin@test.com",
        password: "123456",
        type: "email",
      })

      if (response.code === 200) {
        router.push("/dashboard")
      } else {
        setError("测试账号登录失败，使用模拟登录")
        // 模拟登录成功
        localStorage.setItem("access-token", "test-token-" + Date.now())
        localStorage.setItem("refresh-token", "test-refresh-token-" + Date.now())
        localStorage.setItem("username", "admin")
        localStorage.setItem("isLoggedIn", "true")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (error) {
      console.error("Test login error:", error)
      setError("使用模拟登录")
      // 模拟登录成功
      localStorage.setItem("access-token", "test-token-" + Date.now())
      localStorage.setItem("refresh-token", "test-refresh-token-" + Date.now())
      localStorage.setItem("username", "admin")
      localStorage.setItem("isLoggedIn", "true")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-gray-900">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Kuryr</CardTitle>
          <CardDescription className="text-gray-400">请选择登录方式</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 登录方式选择 */}
            <div className="flex space-x-2 p-1 bg-gray-900 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod("password")}
                className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                  loginMethod === "password" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                密码登录
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("code")}
                className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                  loginMethod === "code" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                验证码登录
              </button>
            </div>

            {/* 账号输入 */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-gray-300 flex items-center gap-2">
                {accountType === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                手机号或邮箱
              </Label>
              <Input
                id="account"
                type="text"
                value={account}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                placeholder="请输入手机号或邮箱"
                required
              />
            </div>

            {/* 密码或验证码输入 */}
            {loginMethod === "password" ? (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                  placeholder="请输入密码"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-300">
                  验证码
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                    placeholder="请输入验证码"
                    maxLength={6}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || countdown > 0 || !account.trim()}
                    className="px-4 bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-700 disabled:text-gray-400"
                  >
                    {sendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "发送验证码"}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert className="bg-red-900/50 border-red-800">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {/* 测试账号区域 */}
            <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">测试账号</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    邮箱: <span className="text-orange-400">admin@test.com</span>
                  </div>
                  <div>
                    密码: <span className="text-orange-400">123456</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestLogin}
                  disabled={loading}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent text-sm"
                >
                  填充测试账号
                </Button>
                <Button
                  type="button"
                  onClick={handleQuickTestLogin}
                  disabled={loading}
                  className="flex-1 bg-orange-600/80 hover:bg-orange-600 text-white text-sm"
                >
                  {loading ? "登录中..." : "快速登录"}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
