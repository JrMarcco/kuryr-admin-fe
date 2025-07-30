"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Truck,
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
    href: "/dashboard/business",
  },
  {
    icon: Truck,
    label: "供应商管理",
    href: "/dashboard/providers",
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
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [username, setUsername] = useState<string>("Admin")

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const hasActiveChild = (children: SidebarItem[]) => {
    return children.some((child) => child.href && isActive(child.href))
  }

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem("access-token")
      localStorage.removeItem("refresh-token")
      router.push("/")
      setIsLoggingOut(false)
    }
  }

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
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.label}
      </Link>
    )
  }

  const getUserInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-background">
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">Kuryr</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>

          <div className="border-t border-border p-4">
            <Card className="bg-accent border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">{getUserInitial(username)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground" title={username}>
                        {username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-muted-foreground hover:text-red-500 hover:bg-destructive/20 p-2"
                    title="登出"
                  >
                    {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
