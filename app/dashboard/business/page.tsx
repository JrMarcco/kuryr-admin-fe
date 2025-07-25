"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Users } from "lucide-react"
import { businessApi, type Business } from "@/lib/business-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { Pagination } from "@/components/pagination"
import { Breadcrumb } from "@/components/breadcrumb"
import { OperatorsModal } from "@/components/operators-modal"
import { BizConfigModal } from "@/components/biz-config-modal"

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isOperatorsModalOpen, setIsOperatorsModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const pageSize = 10

  const { loading, error, execute } = useApi(businessApi.getBusinessList)

  const fetchBusinesses = async (page: number) => {
    const offset = (page - 1) * pageSize
    const response = await execute({
      offset,
      limit: pageSize,
    })

    if (response.code === 200 && response.data) {
      setBusinesses(response.data.content)
      setTotalCount(response.data.total)
      setTotalPages(Math.ceil(response.data.total / pageSize))
    }
  }

  useEffect(() => {
    fetchBusinesses(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewOperators = (business: Business) => {
    setSelectedBusiness(business)
    setIsOperatorsModalOpen(true)
  }

  const handleViewConfig = (business: Business) => {
    setSelectedBusiness(business)
    setIsConfigModalOpen(true)
  }

  const breadcrumbItems = [
    { label: "首页", href: "/dashboard" },
    { label: "业务方管理", href: "/dashboard/business" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">业务方管理</h1>
            <p className="text-gray-400 mt-2">管理和查看所有业务方信息</p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/50 border-red-800">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">业务方列表</CardTitle>
            <CardDescription className="text-gray-400">
              共 {totalCount} 个业务方，当前第 {currentPage} 页
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
                <span className="text-gray-400">加载中...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">业务方名称</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">业务方ID</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">状态</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">创建时间</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">更新时间</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">操作员管理</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">配置管理</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((business) => (
                        <tr key={business.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-white">{business.biz_name}</td>
                          <td className="py-3 px-4 text-gray-300">{business.biz_id}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={business.status === "active" ? "default" : "secondary"}
                              className={
                                business.status === "active"
                                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                                  : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                              }
                            >
                              {business.status === "active" ? "活跃" : "非活跃"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{formatTimestamp(business.created_at)}</td>
                          <td className="py-3 px-4 text-gray-300">{formatTimestamp(business.updated_at)}</td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => handleViewOperators(business)}
                              size="sm"
                              variant="outline"
                              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-black"
                            >
                              <Users className="mr-1 h-4 w-4" />
                              查看
                            </Button>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => handleViewConfig(business)}
                              size="sm"
                              variant="outline"
                              className="border-orange-600 text-orange-400 hover:bg-orange-600/10 bg-black"
                            >
                              <Settings className="mr-1 h-4 w-4" />
                              查看配置
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 操作员模态框 */}
      {selectedBusiness && (
        <OperatorsModal
          isOpen={isOperatorsModalOpen}
          onClose={() => {
            setIsOperatorsModalOpen(false)
            setSelectedBusiness(null)
          }}
          businessId={selectedBusiness.biz_id}
          businessName={selectedBusiness.biz_name}
        />
      )}

      {/* 配置模态框 */}
      {selectedBusiness && (
        <BizConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false)
            setSelectedBusiness(null)
          }}
          businessId={selectedBusiness.biz_id}
          businessName={selectedBusiness.biz_name}
        />
      )}
    </div>
  )
}
