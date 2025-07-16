"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare } from "lucide-react"
import { authApi } from "@/lib/auth-api"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authApi.login({
        Username: username,
        Password: password,
      })

      if (response.code === 200) {
        router.push("/dashboard")
      } else {
        setError(response.msg || "登录失败，请检查用户名和密码")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 在 handleLogin 函数后添加测试账号处理函数
  const handleTestLogin = () => {
    setUsername("admin")
    setPassword("123456")
  }

  const handleQuickTestLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await authApi.login({
        Username: "admin",
        Password: "123456",
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
          <CardDescription className="text-gray-400">请输入您的登录凭据</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                用户名
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-orange-500"
                placeholder="请输入用户名"
                required
              />
            </div>
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
                    用户名: <span className="text-orange-400">admin</span>
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
