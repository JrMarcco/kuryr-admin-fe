"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Settings, Users, Plus, Search } from "lucide-react"
import { businessApi, type Business, type BusinessListRequest } from "@/lib/business-api"
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

  // 搜索条件
  const [searchParams, setSearchParams] = useState<BusinessListRequest>({
    offset: 0,
    limit: pageSize,
    biz_name: ""
  })

  const { loading, error, execute } = useApi(businessApi.getBusinessList)
  const { loading: createLoading, error: createError, execute: executeCreate } = useApi(businessApi.createBusiness)

  const fetchBusinesses = async (page: number = currentPage) => {
    const offset = (page - 1) * pageSize
    const params: BusinessListRequest = {
      offset,
      limit: pageSize,
      biz_name: searchParams.biz_name,
    }

    // 过滤空值
    if (!params.biz_name) delete params.biz_name

    const response = await execute(params)

    if (response.code === 200 && response.data) {
      setBusinesses(response.data.records)
      setTotalCount(response.data.total)
      setTotalPages(Math.ceil(response.data.total / pageSize))
    }
  }

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1)
    fetchBusinesses(1).then(() => {})
  }

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      offset: 0,
      limit: pageSize,
      biz_name: "",
    })
    setCurrentPage(1)
    setTimeout(() => {
      fetchBusinesses(1).then(() => {})
    }, 0)
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
    { label: "仪表板", href: "/dashboard" },
    { label: "业务方管理", href: "/dashboard/business" },
  ]

  return (
    <div className="w-full p-6 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <Breadcrumb items={breadcrumbItems}/>

      <Card className="border-0 shadow-2xl bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 bg-gray-800">
          <CardTitle className="text-xl font-semibold text-white">业务管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-gray-800">
          {/* 搜索区域 */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 rounded-lg border border-gray-600">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="请输入业务名"
                  value={searchParams.biz_name || ""}
                  onChange={(e) => setSearchParams({ ...searchParams, biz_name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleReset} disabled={loading}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-md">
                  重置
                </Button>
                <Button onClick={handleSearch} disabled={loading}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md">
                  <Search className="w-4 h-4 mr-2"/>
                  搜索
                </Button>
              </div>
            </div>
          </div>

          {/* 操作区域 */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300 font-medium">
              共 <span className="text-blue-400 font-bold">{totalCount}</span> 条记录，当前第 <span
              className="text-blue-400 font-bold">{currentPage}</span> 页
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Plus className="mr-2 h-4 w-4"/>
                  新增业务
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">新增业务</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="biz_type" className="text-gray-300">
                      业务类型
                    </Label>
                    <Select
                      value={createForm.biz_type}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, biz_type: value as "individual" | "organization" }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="选择业务类型"/>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="individual" className="text-white hover:bg-gray-700">个人</SelectItem>
                        <SelectItem value="organization" className="text-white hover:bg-gray-700">组织</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biz_key" className="text-gray-300">
                      业务Key
                    </Label>
                    <Input
                      id="biz_key"
                      value={createForm.biz_key}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, biz_key: e.target.value }))}
                      placeholder="请输入业务Key"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
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
                      placeholder="请输入业务名"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
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
                      placeholder="请输入联系人"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
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
                      placeholder="请输入联系人邮箱"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                  {createError && (
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
                      <p className="text-destructive text-sm">创建失败: {createError}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
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
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* 表格 */}
          <div className="border border-gray-600 rounded-xl shadow-lg overflow-hidden bg-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">ID</TableHead>
                  <TableHead className="w-[12%]">业务名</TableHead>
                  <TableHead className="w-[8%]">类型</TableHead>
                  <TableHead className="w-[10%]">联系人</TableHead>
                  <TableHead className="w-[10%]">联系人邮箱</TableHead>
                  <TableHead className="w-[10%]">业务 Key</TableHead>
                  <TableHead className="w-[10%]">业务密钥</TableHead>
                  <TableHead className="w-[10%]">创建时间</TableHead>
                  <TableHead className="w-[10%]">更新时间</TableHead>
                  <TableHead className="w-[6%]">操作员</TableHead>
                  <TableHead className="w-[6%]">配置</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto"/>
                      <div className="mt-2">加载中...</div>
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-mono text-xs" title={formatTimestamp(business.created_at)}>
                        {business.id}
                      </TableCell>
                      <TableCell className="font-medium" title={business.biz_name}>
                        <div className="truncate max-w-[120px] text-white font-semibold">{business.biz_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={business.biz_type === "organization"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                            : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm"}
                        >
                          {business.biz_type === "organization" ? "🏢 组织" : "👤 个人"}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate text-gray-300" title={business.contact}>
                        {business.contact}
                      </TableCell>
                      <TableCell className="truncate text-gray-300" title={business.contact_email}>
                        {business.contact_email}
                      </TableCell>
                      <TableCell className="truncate text-gray-300" title={business.biz_key}>
                        {business.biz_key}
                      </TableCell>
                      <TableCell className="truncate text-gray-300" title={business.biz_secret}>
                        {business.biz_secret}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300" title={formatTimestamp(business.created_at)}>
                        {formatTimestamp(business.created_at).split(" ")[0]}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300" title={formatTimestamp(business.updated_at)}>
                        {formatTimestamp(business.updated_at).split(" ")[0]}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewOperators(business)}
                          size="sm"
                          variant="ghost"
                          title="操作员"
                          className="text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Users className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewConfig(business)}
                          size="sm"
                          variant="ghost"
                          title="配置"
                          className="text-gray-300 hover:bg-orange-600 hover:text-white transition-colors"
                        >
                          <Settings className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
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
        </CardContent>
      </Card>

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
