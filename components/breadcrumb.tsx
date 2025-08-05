"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname()

  // 如果没有传入自定义items，则根据路径自动生成
  const breadcrumbItems = items || generateBreadcrumbItems(pathname)

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="面包屑导航">
      <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
        <Home className="h-4 w-4 mr-1"/>
        首页
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-500 mx-1"/>
          {item.href ? (
            <Link href={item.href} className="text-gray-400 hover:text-orange-400 transition-colors flex items-center">
              {item.icon && <item.icon className="h-4 w-4 mr-1"/>}
              {item.label}
            </Link>
          ) : (
            <span className="text-white flex items-center">
              {item.icon && <item.icon className="h-4 w-4 mr-1"/>}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// 根据路径自动生成面包屑项目
function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split("/").filter(Boolean)
  const items: BreadcrumbItem[] = []

  // 路径映射配置
  const pathMap: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
    dashboard: { label: "仪表板" },
    business: { label: "业务方管理" },
    config: { label: "配置管理" },
    operators: { label: "操作员管理" },
    messages: { label: "消息管理" },
    templates: { label: "模板管理" },
    settings: { label: "系统设置" },
  }

  let currentPath = ""

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const config = pathMap[segment]

    if (config) {
      // 最后一个项目不需要链接
      const isLast = index === pathSegments.length - 1
      items.push({
        label: config.label,
        href: isLast ? undefined : currentPath,
        icon: config.icon,
      })
    }
  })

  return items
}
