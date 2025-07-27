"use client"

import * as React from "react";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Settings, Users, Plus } from "lucide-react"
import { businessApi, type Business } from "@/lib/business-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { Pagination } from "@/components/pagination"
import { Breadcrumb } from "@/components/breadcrumb"
import { OperatorsModal } from "@/components/operators-modal"
import { BizConfigModal } from "@/components/biz-config-modal"

interface CreateBusinessForm {
  biz_key: string
  biz_name: string
  biz_type: "individual" | "organization"
  contact: string
  contact_email: string
}

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isOperatorsModalOpen, setIsOperatorsModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateBusinessForm>({
    biz_key: "",
    biz_name: "",
    biz_type: "organization",
    contact: "",
    contact_email: "",
  })
  const pageSize = 10

  const { loading, error, execute } = useApi(businessApi.getBusinessList)
  const { loading: createLoading, error: createError, execute: executeCreate } = useApi(businessApi.createBusiness)

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
    fetchBusinesses(currentPage).then(() => {})
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

  const handleCreateBusiness = async () => {
    const response = await executeCreate(createForm)

    if (response.code === 200) {
      setIsCreateModalOpen(false)
      setCreateForm({
        biz_key: "",
        biz_name: "",
        biz_type: "organization",
        contact: "",
        contact_email: "",
      })
      // 重新加载业务方列表
      fetchBusinesses(currentPage).then(() => {})
    }
  }

  const breadcrumbItems = [
    { label: "首页", href: "/dashboard" },
    { label: "业务方管理", href: "/dashboard/business" },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="w-full space-y-6">
        <Breadcrumb items={breadcrumbItems}/>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">业务管理</h1>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="mr-2 h-4 w-4"/>
                新增业务
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-900 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">新增业务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biz_type" className="text-gray-300">
                    业务类型
                  </Label>
                  <select
                    id="biz_type"
                    value={createForm.biz_type}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, biz_type: e.target.value as "individual" | "organization" }))
                    }
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-white"
                  >
                    <option value="individual">个人</option>
                    <option value="organization">组织</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz_key" className="text-gray-300">
                    业务Key
                  </Label>
                  <Input
                    id="biz_key"
                    value={createForm.biz_key}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, biz_key: e.target.value }))}
                    className="bg-gray-900 border-gray-800 text-white"
                    placeholder="请输入业务Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz_name" className="text-gray-300">
                    业务名
                  </Label>
                  <Input
                    id="biz_name"
                    value={createForm.biz_name}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, biz_name: e.target.value }))}
                    className="bg-gray-900 border-gray-800 text-white"
                    placeholder="请输入业务名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-300">
                    联系人
                  </Label>
                  <Input
                    id="contact"
                    value={createForm.contact}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, contact: e.target.value }))}
                    className="bg-gray-900 border-gray-800 text-white"
                    placeholder="请输入联系人"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-gray-300">
                    联系人邮箱
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={createForm.contact_email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, contact_email: e.target.value }))}
                    className="bg-gray-900 border-gray-800 text-white"
                    placeholder="请输入联系人邮箱"
                  />
                </div>
                {createError && (
                  <div className="bg-red-900/50 border border-red-800 rounded-lg p-3">
                    <p className="text-red-300 text-sm">创建失败: {createError}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateBusiness}
                    disabled={createLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        创建中...
                      </>
                    ) : (
                      "创建"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2"/>
                <span className="text-gray-400">加载中...</span>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <table className="w-full table-fixed">
                    <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[8%]">ID</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[12%]">业务名</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[8%]">类型</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">联系人</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">联系人邮箱</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">业务 Key</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">业务密钥</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">创建时间</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[10%]">更新时间</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[6%]">操作员</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium w-[6%]">配置</th>
                    </tr>
                    </thead>
                    <tbody>
                    {businesses.map((business) => (
                      <tr key={business.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-2 text-gray-300 text-xs" title={formatTimestamp(business.created_at)}>
                          {business.id}
                        </td>
                        <td className="py-3 px-2 text-white truncate" title={business.biz_name}>
                          {business.biz_name}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="secondary"
                            className={
                              business.biz_type === "organization"
                                ? "bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs"
                                : "bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs"
                            }
                          >
                            {business.biz_type === "organization" ? "组织" : "个人"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-300 truncate" title={business.contact}>
                          {business.contact}
                        </td>
                        <td className="py-3 px-2 text-gray-300 truncate" title={business.contact_email}>
                          {business.contact_email}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="secondary"
                            className="bg-gray-900 text-gray-300 border-gray-800 text-xs truncate max-w-full"
                            title={business.biz_key}
                          >
                            {business.biz_key}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-1">
                              <span className="font-mono text-xs text-gray-300 truncate flex-1">
                                {business.biz_secret}
                              </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-300 text-xs" title={formatTimestamp(business.created_at)}>
                          {formatTimestamp(business.updated_at).split(" ")[0]}
                        </td>
                        <td className="py-3 px-2 text-gray-300 text-xs" title={formatTimestamp(business.updated_at)}>
                          {formatTimestamp(business.updated_at).split(" ")[0]}
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            onClick={() => handleViewOperators(business)}
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-black h-7 px-2 text-xs"
                          >
                            <Users className="h-3 w-3"/>
                          </Button>
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            onClick={() => handleViewConfig(business)}
                            size="sm"
                            variant="outline"
                            className="border-orange-600 text-orange-400 hover:bg-orange-600/10 bg-black h-7 px-2 text-xs"
                          >
                            <Settings className="h-3 w-3"/>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalCount}
                      onPageChange={handlePageChange}
                      onPageSizeChange={(newPageSize) => {
                        // Handle page size change if needed
                        console.log("Page size changed to:", newPageSize)
                      }}
                    />
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
          businessId={selectedBusiness.id}
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
          businessId={selectedBusiness.id}
          businessName={selectedBusiness.biz_name}
        />
      )}
    </div>
  )
}
