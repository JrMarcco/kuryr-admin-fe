"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { Plus, Edit, Trash2, Settings, Loader2, RefreshCw } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Pagination } from "@/components/pagination"
import { configApi, type BizConfig } from "@/lib/config-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"

export default function ConfigManagePage() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get("id")
  const businessName = searchParams.get("name")

  // 判断是否从业务方管理页面进入（有业务方ID和名称）
  const isFromBusinessPage = businessId && businessName

  const [configs, setConfigs] = useState<BizConfig[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BizConfig | null>(null)
  const [formData, setFormData] = useState({
    biz_id: businessId || "",
    config_key: "",
    config_value: "",
    config_desc: "",
  })

  // 使用 useApi hook 管理API调用状态
  const {
    data: configListData,
    loading: configListLoading,
    error: configListError,
    execute: fetchConfigList,
  } = useApi(configApi.getConfigList)

  // 加载配置列表
  const loadConfigList = async (page = currentPage, size = pageSize) => {
    const offset = (page - 1) * size
    const params = {
      offset,
      limit: size,
      ...(businessId && { biz_id: businessId }),
    }

    const response = await fetchConfigList(params)

    if (response.code === 200 && response.data) {
      setConfigs(response.data.content || [])
      setTotalCount(response.data.total || 0)
    }
  }

  // 初始加载
  useEffect(() => {
    loadConfigList()
  }, [businessId])

  // 分页变化时重新加载
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadConfigList(page, pageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    loadConfigList(1, size)
  }

  // 刷新数据
  const handleRefresh = () => {
    loadConfigList()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = Date.now()

    if (editingConfig) {
      // 编辑
      setConfigs((prev) =>
        prev.map((config) =>
          config.id === editingConfig.id
            ? {
                ...config,
                biz_id: formData.biz_id,
                config_key: formData.config_key,
                config_value: formData.config_value,
                config_desc: formData.config_desc,
                updated_at: now,
              }
            : config,
        ),
      )
    } else {
      // 新增
      const newConfig: BizConfig = {
        id: Date.now().toString(),
        biz_id: formData.biz_id,
        config_key: formData.config_key,
        config_value: formData.config_value,
        config_desc: formData.config_desc,
        created_at: now,
        updated_at: now,
      }
      setConfigs((prev) => [newConfig, ...prev])
      setTotalCount((prev) => prev + 1)
    }

    resetForm()
  }

  const handleEdit = (config: BizConfig) => {
    setEditingConfig(config)
    setFormData({
      biz_id: config.biz_id,
      config_key: config.config_key,
      config_value: config.config_value,
      config_desc: config.config_desc,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个配置吗？")) {
      setConfigs((prev) => prev.filter((config) => config.id !== id))
      setTotalCount((prev) => prev - 1)
    }
  }

  const resetForm = () => {
    setFormData({
      biz_id: businessId || "",
      config_key: "",
      config_value: "",
      config_desc: "",
    })
    setEditingConfig(null)
    setIsDialogOpen(false)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          isFromBusinessPage
            ? [{ label: "业务方管理", href: "/dashboard/business" }, { label: "配置管理" }]
            : [{ label: "配置管理" }]
        }
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Settings className="mr-3 h-7 w-7 text-orange-500" />
            配置管理
          </h1>
          <p className="text-gray-400 mt-1">
            {isFromBusinessPage ? `管理 ${businessName} 的配置信息` : "管理所有业务方的配置信息"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={configListLoading}
            className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${configListLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                新增配置
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{editingConfig ? "编辑配置" : "新增配置"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingConfig ? "修改配置信息" : "添加新的配置项"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="biz_id" className="text-gray-300">
                      业务方ID
                    </Label>
                    <Input
                      id="biz_id"
                      value={formData.biz_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, biz_id: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入业务方ID"
                      disabled={isFromBusinessPage}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config_key" className="text-gray-300">
                      配置键
                    </Label>
                    <Input
                      id="config_key"
                      value={formData.config_key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, config_key: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入配置键"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config_value" className="text-gray-300">
                      配置值
                    </Label>
                    <Input
                      id="config_value"
                      value={formData.config_value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, config_value: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入配置值"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config_desc" className="text-gray-300">
                      配置描述
                    </Label>
                    <Input
                      id="config_desc"
                      value={formData.config_desc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, config_desc: e.target.value }))}
                      className="bg-gray-900 border-gray-800 text-white"
                      placeholder="请输入配置描述"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
                  >
                    取消
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                    {editingConfig ? "更新" : "创建"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Business Info Card - 只在从业务方管理页面进入时显示 */}
      {isFromBusinessPage && (
        <Card className="bg-black border-gray-900">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="mr-2 h-5 w-5 text-orange-500" />
              当前业务方信息
            </CardTitle>
            <CardDescription className="text-gray-400">当前配置管理的业务方详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 font-medium whitespace-nowrap min-w-[100px]">业务方ID:</span>
                <Badge variant="secondary" className="bg-gray-900 text-gray-300 border-gray-800 whitespace-nowrap">
                  {businessId}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 font-medium whitespace-nowrap min-w-[100px]">业务方名称:</span>
                <span className="text-white font-medium whitespace-nowrap">{businessName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {configListError && (
        <Alert className="bg-red-900/50 border-red-800">
          <AlertDescription className="text-red-300 flex items-center justify-between">
            <span>{configListError}</span>
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
          <CardTitle className="text-white">配置列表</CardTitle>
          <CardDescription className="text-gray-400">
            {isFromBusinessPage ? `${businessName} 的所有配置项` : "所有业务方的配置信息"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configListLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mr-3" />
              <span className="text-gray-400">加载中...</span>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">{configListError ? "加载失败" : "暂无配置数据"}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-900 hover:bg-gray-900/50">
                      <TableHead className="text-gray-300 text-left min-w-[120px]">业务方ID</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">配置键</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[180px]">配置值</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[200px]">配置描述</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">创建时间</TableHead>
                      <TableHead className="text-gray-300 text-left min-w-[140px]">更新时间</TableHead>
                      <TableHead className="text-gray-300 text-center min-w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.id} className="border-gray-900 hover:bg-gray-900/50">
                        <TableCell className="text-gray-300 text-left align-top py-4">
                          <Badge variant="secondary" className="bg-gray-900 text-gray-300 border-gray-800">
                            {config.biz_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium text-left align-top py-4">
                          {config.config_key}
                        </TableCell>
                        <TableCell className="text-gray-300 text-left align-top py-4">
                          <span className="font-mono text-sm break-all">{config.config_value}</span>
                        </TableCell>
                        <TableCell className="text-gray-300 text-left align-top py-4">
                          {config.config_desc || "-"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm text-left align-top py-4 whitespace-nowrap">
                          {formatTimestamp(config.created_at)}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm text-left align-top py-4 whitespace-nowrap">
                          {formatTimestamp(config.updated_at)}
                        </TableCell>
                        <TableCell className="text-center align-top py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(config)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-orange-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(config.id)}
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
                loading={configListLoading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
