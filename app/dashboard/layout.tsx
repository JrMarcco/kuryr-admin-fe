"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, LogOut, Menu, X, Settings, ChevronDown, ChevronRight } from "lucide-react"
import { authApi } from "@/lib/auth-api"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [businessMenuOpen, setBusinessMenuOpen] = useState(true) // 默认展开业务方管理菜单
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (authApi.isLoggedIn()) {
      const user = authApi.getCurrentUser()
      if (user) {
        setIsLoggedIn(true)
        setUsername(user.username)
      } else {
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    authApi.logout()
    router.push("/")
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500">加载中...</div>
      </div>
    )
  }

  const menuItems = [
    {
      name: "业务方管理",
      href: "/dashboard/business",
      icon: Building2,
      active: pathname === "/dashboard/business",
      children: [
        {
          name: "配置管理",
          href: "/dashboard/business/config",
          icon: Settings,
          active: pathname.startsWith("/dashboard/business/config"),
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-gray-900"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-gray-900 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-900">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-semibold text-white">Kuryr</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isBusinessMenu = item.name === "业务方管理"

              return (
                <div key={item.href}>
                  {/* 主菜单项 */}
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                        item.active ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-900 hover:text-white"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isBusinessMenu && setBusinessMenuOpen(!businessMenuOpen)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-900 ml-1"
                      >
                        {isBusinessMenu && businessMenuOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* 子菜单项 */}
                  {hasChildren && isBusinessMenu && businessMenuOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                              child.active
                                ? "bg-orange-600/80 text-white"
                                : "text-gray-400 hover:bg-gray-900 hover:text-white"
                            }`}
                          >
                            <ChildIcon className="mr-3 h-4 w-4" />
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="px-4 py-4 border-t border-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="text-gray-400">当前用户</div>
                <div className="text-white font-medium">{username}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="min-h-screen bg-black">{children}</main>
      </div>
    </div>
  )
}
