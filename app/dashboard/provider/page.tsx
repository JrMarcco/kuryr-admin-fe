"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { Pagination } from "@/components/pagination"
import { ProviderModal } from "@/components/provider-modal"
import { Eye, Trash2, Plus, Search, Loader2 } from "lucide-react"
import { providerApi, type Provider, type ProviderListRequest } from "@/lib/provider-api"
import { useToast } from "@/hooks/use-toast"

export default function ProviderPage() {

  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)

  // 搜索条件
  const [searchParams, setSearchParams] = useState<ProviderListRequest>({
    offset: 0,
    limit: 20,
    provider_name: "",
    channel: 0
  })

  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">("view")
  const [selectedProviderId, setSelectedProviderId] = useState<number>()

  // 确认对话框状态
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertAction, setAlertAction] = useState<"delete" | "toggle">("delete")
  const [alertTarget, setAlertTarget] = useState<Provider>()
  const [actionLoading, setActionLoading] = useState(false)

  const breadcrumbItems = [
    { label: "仪表板", href: "/dashboard" },
    { label: "供应商管理", href: "/dashboard/provider" },
  ]

  // 获取供应商列表
  const fetchProviders = async (page = currentPage) => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const params: ProviderListRequest = {
        offset: offset,
        limit: pageSize,
        provider_name: searchParams.provider_name,
        channel: searchParams.channel,
      }

      // 过滤空值
      if (!params.provider_name) delete params.provider_name
      if (!params.channel) delete params.channel

      const response = await providerApi.getList(params)
      if (response.code === 200 && response.data) {
        setProviders(response.data.records || [])
        setTotalCount(response.data.total)
        setTotalPages(Math.ceil(response.data.total / pageSize))
      } else {
        toast({
          title: "获取供应商列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取供应商列表失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders(1).then(() => {})
  }, [])

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1)
    fetchProviders(1).then(() => {})
  }

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      offset: 0,
      limit: 20,
      provider_name: "",
      channel: 0,
    })
    setCurrentPage(1)
    setTimeout(() => {
      fetchProviders(1).then(() => {})
    }, 0)
  }

  // 分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProviders(page).then(() => {})
  }

  // 查看详情
  const handleView = (provider: Provider) => {
    setSelectedProviderId(provider.id)
    setModalMode("view")
    setModalOpen(true)
  }

  // 新增供应商
  const handleCreate = () => {
    setSelectedProviderId(undefined)
    setModalMode("create")
    setModalOpen(true)
  }

  // 启用/禁用供应商
  const handleToggleStatus = (provider: Provider) => {
    setAlertTarget(provider)
    setAlertAction("toggle")
    setAlertOpen(true)
  }

  // 删除供应商
  const handleDelete = (provider: Provider) => {
    setAlertTarget(provider)
    setAlertAction("delete")
    setAlertOpen(true)
  }

  // 确认操作
  const handleConfirmAction = async () => {
    if (!alertTarget) return

    setActionLoading(true)
    try {
      if (alertAction === "delete") {
        const response = await providerApi.delete(alertTarget.id)
        if (response.code === 200) {
          toast({
            title: "删除成功",
            description: "供应商已删除",
          })
          fetchProviders().then(() => {})
        } else {
          toast({
            title: "删除失败",
            description: response.msg || "请稍后重试",
            variant: "destructive",
          })
        }
      } else if (alertAction === "toggle") {
        const newStatus = alertTarget.active_status === "active" ? "inactive" : "active"
        const response = await providerApi.updateStatus(alertTarget.id, newStatus)
        if (response.code === 200) {
          toast({
            title: "状态更新成功",
            description: `供应商已${newStatus === "active" ? "启用" : "禁用"}`,
          })
          fetchProviders().then(() => {})
        } else {
          toast({
            title: "状态更新失败",
            description: response.msg || "请稍后重试",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
      setAlertOpen(false)
      setAlertTarget(undefined)
    }
  }

  return (
    <div className="w-full p-6 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <Breadcrumb items={breadcrumbItems}/>

      <Card className="border-0 shadow-2xl bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 bg-gray-800">
          <CardTitle className="text-xl font-semibold text-white">供应商管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-gray-800">
          {/* 搜索区域 */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 rounded-lg border border-gray-600">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="请输入供应商名称"
                  value={searchParams.provider_name || ""}
                  onChange={(e) => setSearchParams({ ...searchParams, provider_name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
              <div className="min-w-[150px]">
                <Select
                  value={searchParams.channel ? String(searchParams.channel) : "all"}
                  onValueChange={(value) =>
                    setSearchParams({
                      ...searchParams,
                      channel: value === "all" ? 0 : (Number.parseInt(value) as 1 | 2)
                    })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-emerald-400">
                    <SelectValue placeholder="选择渠道"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-600">全部</SelectItem>
                    <SelectItem value="1" className="text-white hover:bg-gray-600">短信</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-gray-600">邮件</SelectItem>
                  </SelectContent>
                </Select>
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
              共 <span className="text-emerald-400 font-bold">{totalCount}</span> 条记录，当前第 <span
              className="text-emerald-400 font-bold">{currentPage}</span> 页
            </div>
            <Button onClick={handleCreate}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200">
              <Plus className="w-4 h-4 mr-2"/>
              新增供应商
            </Button>
          </div>

          {/* 表格 */}
          <div className="border border-gray-600 rounded-xl shadow-lg overflow-hidden bg-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">ID</TableHead>
                  <TableHead className="w-[20%]">供应商名称</TableHead>
                  <TableHead className="w-[12%]">渠道</TableHead>
                  <TableHead className="w-[8%]">权重</TableHead>
                  <TableHead className="w-[10%]">QPS 限流</TableHead>
                  <TableHead className="w-[10%]">每日限流</TableHead>
                  <TableHead className="w-[10%]">启用状态</TableHead>
                  <TableHead className="w-[10%]">查看详情</TableHead>
                  <TableHead className="w-[10%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto"/>
                      <div className="mt-2">加载中...</div>
                    </TableCell>
                  </TableRow>
                ) : providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-mono text-xs">{provider.id}</TableCell>
                      <TableCell className="font-medium" title={provider.provider_name}>
                        <div className="truncate max-w-[120px] text-white font-semibold">{provider.provider_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={provider.channel === 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                          : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm"}>
                          {provider.channel === 1 ? "📱 短信" : "📧 邮件"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{provider.weight}</TableCell>
                      <TableCell className="text-gray-300">{provider.qps_limit}</TableCell>
                      <TableCell className="text-gray-300">{provider.daily_limit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={provider.active_status === "active"}
                            onCheckedChange={() => handleToggleStatus(provider)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 shadow-sm"
                          />
                          <span className={`text-xs font-medium ${
                            provider.active_status === "active"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}>
                            {provider.active_status === "active" ? "✅ 启用" : "❌ 禁用"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleView(provider)} title="查看详情"
                                className="text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                          <Eye className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(provider)} title="删除"
                                className="text-red-400 hover:text-red-200 hover:bg-red-600 transition-colors">
                          <Trash2 className="h-4 w-4"/>
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

      {/* 供应商详情/新增模态框 */}
      <ProviderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        providerId={selectedProviderId}
        mode={modalMode}
        onSuccess={() => fetchProviders()}
      />

      {/* 确认对话框 */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-white">{alertAction === "delete" ? "确认删除" : "确认操作"}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {alertAction === "delete" && <>确定要删除供应商 "{alertTarget?.provider_name}" 吗？此操作不可撤销。</>}
              {alertAction === "toggle" && (
                <>
                  确定要{alertTarget?.active_status === "active" ? "禁用" : "启用"}供应商 "{alertTarget?.provider_name}"
                  吗？
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}
                               className="border-gray-600 text-gray-300 hover:bg-gray-800">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={actionLoading}
                               className="bg-orange-600 hover:bg-orange-700 text-white">
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
