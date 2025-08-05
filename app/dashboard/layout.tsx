"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { LayoutDashboard, Building2, LogOut, Menu, X, ChevronDown, ChevronRight, Loader2, Truck, FileText } from "lucide-react"
import { authApi } from "@/lib/auth-api"

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: "仪表板",
    href: "/dashboard",
  },
  {
    icon: Building2,
    label: "业务管理",
    href: "/dashboard/business",
  },
  {
    icon: Truck,
    label: "供应商管理",
    href: "/dashboard/provider",
  },
  {
    icon: FileText,
    label: "模板管理",
    href: "/dashboard/template",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [username, setUsername] = useState<string>("Admin") // 添加用户名状态

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  // 检查当前路径是否激活
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // 检查是否有子项激活
  const hasActiveChild = (children: SidebarItem[]) => {
    return children.some((child) => child.href && isActive(child.href))
  }

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // 调用登出API
      await authApi.logout()
    } finally {
      // 无论API调用是否成功，都执行本地清理
      localStorage.removeItem("access-token")
      localStorage.removeItem("refresh-token")

      // 跳转到登录页
      router.push("/")
      setIsLoggingOut(false)
    }
  }

  // 渲染侧边栏项目
  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isItemActive = item.href ? isActive(item.href) : false
    const hasActiveChildren = hasChildren ? hasActiveChild(item.children!) : false

    return (
      <Link
        key={item.label}
        href={item.href!}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform ${
          isItemActive
            ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-105 border border-orange-400/30"
            : level > 0
              ? "text-gray-400 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:text-white hover:shadow-md hover:scale-105"
              : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 hover:text-white hover:shadow-md hover:scale-105"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className={`mr-3 h-5 w-5 ${isItemActive ? 'text-white' : ''}`}/>
        {item.label}
      </Link>
    )
  }

  const getUserInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 侧边栏 */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div
            className="flex items-center justify-between h-16 px-4 border-b border-gray-700 bg-gradient-to-r from-gray-700 to-gray-600">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Kuryr</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg"
            >
              <X className="h-5 w-5"/>
            </Button>
          </div>

          {/* Navigation - takes remaining space */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>

          {/* User info - stays at the bottom */}
          <div className="border-t border-gray-700 p-4">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 rounded-xl shadow-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-orange-400/30">
                    <span className="text-white text-sm font-bold">{getUserInitial(username)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white" title={username}>
                      {username}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-gray-300 hover:text-red-400 hover:bg-red-600/20 p-2 rounded-xl transition-all duration-200 hover:scale-105"
                  title="登出"
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin"/> : <LogOut className="h-4 w-4"/>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* 顶部导航栏 */}
        <header
          className="h-16 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 flex items-center justify-between px-4 lg:px-6 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-600 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Menu className="h-5 w-5"/>
          </Button>
          <div className="flex-1"/>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}/>
      )}
    </div>
  )
}
