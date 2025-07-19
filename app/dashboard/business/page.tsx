
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Eye, EyeOff, Users, Loader2, RefreshCw, Settings } from "lucide-react"
import { OperatorsModal } from "@/components/operators-modal"
import { Pagination } from "@/components/pagination"
import { Breadcrumb } from "@/components/breadcrumb"
import { businessApi } from "@/lib/business-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"

interface Business {
  id: string
  biz_name: string
  biz_key: string
  biz_secret: string
  contact: string
  contact_email: string
  created_at: number
  updated_at: number
}

export default function BusinessManagePage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    biz_name: "",
    biz_key: "",
    contact: "",
    contact_email: "",
  })

  const [operatorsModal, setOperatorsModal] = useState({
    isOpen: false,
    businessId: "",
    businessName: "",
  })

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 使用 useApi hook 管理API调用状态
  const {
    data: businessListData,
    loading: businessListLoading,
    error: businessListError,
    execute: fetchBusinessList,
  } = useApi(businessApi.getBusinessList)

  // 创建业务方的 API hook
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate,
  } = useApi(businessApi.createBusiness)

  // 加载业务方列表
  const loadBusinessList = async (page = currentPage, size = pageSize) => {
    const offset = (page - 1) * size
    const response = await fetchBusinessList({ offset, limit: size })

    if (response.code === 200 && response.data) {
      setBusinesses(response.data.content || [])
      setTotalCount(response.data.total || 0)
    }
  }

  // 初始加载
  useEffect(() => {
    loadBusinessList()
  }, [])

  // 分页变化时重新加载
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadBusinessList(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    loadBusinessList(1, size)
  }

  // 刷新数据
  const handleRefresh = () => {
    loadBusinessList()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingBusiness) {
        // 编辑逻辑暂时保持原样
        const now = Date.now()
        setBusinesses((prev) =>
          prev.map((business) =>
            business.id === editingBusiness.id
              ? {
                ...business,
                biz_name: formData.biz_name,
                biz_key: formData.biz_key,
                biz_secret: "",
                updated_at: now,
              }
              : business,
          ),
        )
      } else {
        // 新增业务方 - 调用API
        const response = await executeCreate({
          biz_name: formData.biz_name,
          biz_key: formData.biz_key,
          contact: formData.contact,
          contact_email: formData.contact_email,
        })

        if (response.code === 200 && response.data) {
          // 创建成功后重新加载列表
          await loadBusinessList(1, pageSize)
          setCurrentPage(1) // 回到第一页显示新创建的数据
          resetForm()
        } else {
          // API 返回错误，不关闭弹窗
          console.error('创建业务方失败:', response.msg)
          return
        }
      }

      resetForm()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setFormData({
      biz_name: business.biz_name,
      biz_key: business.biz_key,
      contact: business.contact,
      contact_email: business.contact_email,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个业务方吗？")) {
      setBusinesses((prev) => prev.filter((business) => business.id !== id))
      setTotalCount((prev) => prev - 1)
    }
  }

  const resetForm = () => {
    setFormData({ biz_name: "", biz_key: "", contact: "", contact_email: "" })
    setEditingBusiness(null)
    setIsDialogOpen(false)
  }

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleViewOperators = (business: Business) => {
    setOperatorsModal({
      isOpen: true,
      businessId: business.id,
      businessName: business.biz_name,
    })
  }

  const closeOperatorsModal = () => {
    setOperatorsModal({
      isOpen: false,
      businessId: "",
      businessName: "",
    })
  }

  const handleConfigManage = (business: Business) => {
    // 跳转到配置管理页面，传递业务方信息
    router.push(`/dashboard/business/config?id=${business.id}&name=${encodeURIComponent(business.biz_name)}`)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">业务方管理</h1>
          <p className="text-gray-400 mt-1">管理消息中心的业务方配置</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={businessListLoading}
            className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${businessListLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                新增业务方
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{editingBusiness ? "编辑业务方" : "新增业务方"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingBusiness ? "修改业务方信息" : "添加新的业务方配置"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="biz_name" className="text-gray-300">
                      业务名
                    </Label>
                    <Input
                      id="biz_name"
                      value={formData.biz_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, biz_name: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入业务名"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biz_key" className="text-gray-300">
                      业务Key
                    </Label>
                    <Input
                      id="biz_key"
                      value={formData.biz_key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, biz_key: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入业务Key"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-gray-300">
                      联系人
                    </Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入联系人"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-gray-300">
                      联系人邮箱
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入联系人邮箱"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* 显示创建错误 */}
                {createError && !editingBusiness && (
                  <Alert className="bg-red-900/50 border-red-800 mb-4">
                    <AlertDescription className="text-red-300">
                      创建失败: {createError}
                    </AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingBusiness ? "更新中..." : "创建中..."}
                      </>
                    ) : (
                      editingBusiness ? "更新" : "创建"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {businessListError && (
        <Alert className="bg-red-900/50 border-red-800">
          <AlertDescription className="text-red-300 flex items-center justify-between">
            <span>{businessListError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4 border-red-700 text-red-300 hover:bg-red-800 bg-transparent"
            >
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card className="bg-black border-gray-900">
        <CardHeader>
          <CardTitle className="text-white">业务方列表</CardTitle>
          <CardDescription className="text-gray-400">管理所有业务方的配置信息</CardDescription>
        </CardHeader>
        <CardContent>
          {businessListLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mr-3" />
              <span className="text-gray-400">加载中...</span>
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">{businessListError ? "加载失败" : "暂无业务方数据"}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-900 hover:bg-gray-900/50">
                      <TableHead className="text-gray-300 text-left min-w-[120px]">业务名</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">业务Key</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[180px]">业务Secret</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">创建时间</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">更新时间</TableHead>
                      <TableHead className="text-gray-300 text-center min-w-[120px]">操作员管理</TableHead>
                      <TableHead className="text-gray-300 text-center min-w-[120px]">配置管理</TableHead>
                      <TableHead className="text-gray-300 text-center min-w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((business) => (
                      <TableRow key={business.id} className="border-gray-900 hover:bg-gray-900/50">
                        <TableCell className="text-white font-medium text-left align-top py-4">
                          {business.biz_name}
                        </TableCell>
                        <TableCell className="text-gray-300 text-left align-top py-4">
                          <Badge variant="secondary" className="bg-gray-900 text-gray-300 border-gray-800">
                            {business.biz_key}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-left align-top py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {business.biz_secret}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm text-left align-top py-4 whitespace-nowrap">
                          {formatTimestamp(business.created_at)}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm text-left align-top py-4 whitespace-nowrap">
                          {formatTimestamp(business.updated_at)}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center align-top py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOperators(business)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-gray-900 whitespace-nowrap"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            查看操作员
                          </Button>
                        </TableCell>
                        <TableCell className="text-gray-300 text-center align-top py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfigManage(business)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-900 whitespace-nowrap"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            查看配置
                          </Button>
                        </TableCell>
                        <TableCell className="text-center align-top py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(business)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(business.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalCount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={businessListLoading}
              />
            </>
          )}
        </CardContent>
      </Card>

      <OperatorsModal
        isOpen={operatorsModal.isOpen}
        onClose={closeOperatorsModal}
        businessId={operatorsModal.businessId}
        businessName={operatorsModal.businessName}
      />
    </div>
  )
}
