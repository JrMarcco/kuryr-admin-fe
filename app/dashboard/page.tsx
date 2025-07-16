"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // 默认跳转到业务方管理页面
    router.push("/dashboard/business")
  }, [router])

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="text-center text-gray-400">正在跳转到业务方管理...</div>
    </div>
  )
}
