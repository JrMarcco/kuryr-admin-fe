"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/breadcrumb"
import { Settings } from "lucide-react"

export default function ConfigManagePage() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get("id")
  const businessName = searchParams.get("name")

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "业务方管理", href: "/dashboard/business" }, { label: "配置管理" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Settings className="mr-3 h-7 w-7 text-orange-500" />
            配置管理
          </h1>
          <p className="text-gray-400 mt-1">管理业务方的详细配置信息</p>
        </div>
      </div>

      {/* Business Info Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="mr-2 h-5 w-5 text-orange-500" />
            业务方信息
          </CardTitle>
          <CardDescription className="text-gray-400">当前配置管理的业务方详情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
              <span className="text-gray-400 font-medium whitespace-nowrap min-w-[100px]">业务方名称:</span>
              <span className="text-white font-medium whitespace-nowrap">{businessName || "未知业务方"}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 font-medium whitespace-nowrap min-w-[100px]">业务方ID:</span>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300 whitespace-nowrap">
                {businessId || "未知"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Configuration Placeholder */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">配置项</CardTitle>
          <CardDescription className="text-gray-400">业务方的详细配置设置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <Settings className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-4">配置管理功能开发中</p>
            <div className="space-y-2">
              <p className="text-sm flex items-center justify-center">
                <span className="mr-2">当前业务方:</span>
                <span className="text-orange-400 font-medium whitespace-nowrap">{businessName || "未知业务方"}</span>
              </p>
              <p className="text-sm flex items-center justify-center">
                <span className="mr-2">业务方ID:</span>
                <span className="text-orange-400 font-medium whitespace-nowrap">{businessId || "未知"}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
