"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
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
    label: "业务方管理",
    children: [
      {
        icon: Building2,
        label: "业务方管理",
        href: "/dashboard/business",
      },
      {
        icon: Settings,
        label: "配置管理",
        href: "/dashboard/business/config",
      },
    ],
  },
  {
    icon: MessageSquare,
    label: "消息管理",
    href: "/dashboard/messages",
  },
  {
    icon: FileText,
    label: "模板管理",
    href: "/dashboard/templates",
  },
  {
    icon: Settings,
    label: "系统设置",
    href: "/dashboard/settings",
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
  const [expandedItems, setExpandedItems] = useState<string[]>(["业务方管理"])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  // 切换展开状态
  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // 调用登出API
      const response = await authApi.logout()

      if (response.code === 200) {
        console.log("登出成功")
      } else {
        console.warn("登出API调用失败:", response.msg)
      }
    } catch (error) {
      console.error("登出过程中发生错误:", error)
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
    const isExpanded = expandedItems.includes(item.label)
    const isItemActive = item.href ? isActive(item.href) : false
    const hasActiveChildren = hasChildren ? hasActiveChild(item.children!) : false

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.label)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasActiveChildren
                ? "bg-orange-900/50 text-orange-300"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </div>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {isExpanded && (
            <div className="ml-4 space-y-1">{item.children!.map((child) => renderSidebarItem(child, level + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        href={item.href!}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isItemActive
            ? "bg-orange-600 text-white"
            : level > 0
              ? "text-gray-400 hover:bg-gray-800 hover:text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      {/* 侧边栏 */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-900 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-white">Kuryr</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </nav>

        {/* 用户信息和登出 */}
        <div className="border-t border-gray-900 p-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Admin</p>
                    <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                      管理员
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 p-2"
                  title="登出"
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* 顶部导航栏 */}
        <header className="h-16 bg-black border-b border-gray-900 flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
