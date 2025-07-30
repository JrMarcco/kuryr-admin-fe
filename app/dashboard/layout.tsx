"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Building2,
  Settings,
  Users,
  MessageSquare,
  FileText,
  Activity,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react"

interface SidebarItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "仪表板",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "业务方管理",
    href: "/dashboard/business",
    icon: Building2,
  },
  {
    title: "供应商管理",
    href: "/dashboard/providers",
    icon: Users,
  },
  {
    title: "消息管理",
    icon: MessageSquare,
    children: [
      {
        title: "消息模板",
        href: "/dashboard/messages/templates",
        icon: FileText,
      },
      {
        title: "发送记录",
        href: "/dashboard/messages/records",
        icon: Activity,
      },
    ],
  },
  {
    title: "系统设置",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

function SidebarContent() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["消息管理"])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0
    const isActive = item.href === pathname

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-left font-normal", level > 0 && "pl-8")}
            onClick={() => toggleExpanded(item.title)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
            {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
          </Button>
          {isExpanded && (
            <div className="ml-4 space-y-1">{item.children.map((child) => renderSidebarItem(child, level + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.title}
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start text-left font-normal", level > 0 && "pl-8", isActive && "bg-secondary")}
        asChild
      >
        <Link href={item.href!}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <MessageSquare className="h-6 w-6" />
          <span>消息中心</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">{sidebarItems.map((item) => renderSidebarItem(item))}</div>
      </ScrollArea>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r bg-background lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40 bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="用户头像" />
                  <AvatarFallback>管理员</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">管理员</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
