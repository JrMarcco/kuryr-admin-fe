"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { CustomPagination } from "@/components/pagination"
import { ProviderModal } from "@/components/provider-modal"
import { Eye, Power, Trash2, Plus, Search, Loader2 } from "lucide-react"
import { providerApi, type Provider, type ProviderListParams } from "@/lib/provider-api"
import { useToast } from "@/hooks/use-toast"

export default function ProvidersPage() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // 搜索条件
  const [searchParams, setSearchParams] = useState<ProviderListParams>({
    provider_name: "",
    channel: "",
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
    { label: "供应商管理", href: "/dashboard/providers" },
  ]

  // 获取供应商列表
  const fetchProviders = async (page = currentPage) => {
    setLoading(true)
    try {
      const params: ProviderListParams = {
        page,
        page_size: pageSize,
        ...searchParams,
      }

      // 过滤空值
      if (!params.provider_name) delete params.provider_name
      if (!params.channel) delete params.channel

      const response = await providerApi.getList(params)
      if (response.code === 200 && response.data) {
        setProviders(response.data.list || [])
        setTotal(response.data.total || 0)
        setCurrentPage(response.data.page || 1)
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
    fetchProviders(1)
  }, [])

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1)
    fetchProviders(1)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      provider_name: "",
      channel: "",
    })
    setCurrentPage(1)
    setTimeout(() => {
      fetchProviders(1)
    }, 0)
  }

  // 分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProviders(page)
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
          fetchProviders()
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
          fetchProviders()
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

  const getChannelText = (channel: 1 | 2) => {
    return channel === 1 ? "短信" : "邮件"
  }

  const getChannelBadge = (channel: 1 | 2) => {
    return <Badge variant={channel === 1 ? "default" : "secondary"}>{getChannelText(channel)}</Badge>
  }

  const getStatusBadge = (status: "active" | "inactive") => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>{status === "active" ? "启用" : "禁用"}</Badge>
    )
  }

  return (
    <div className="w-full p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <Card>
        <CardHeader>
          <CardTitle>供应商管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索区域 */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">供应商名称</label>
              <Input
                placeholder="请输入供应商名称"
                value={searchParams.provider_name || ""}
                onChange={(e) => setSearchParams({ ...searchParams, provider_name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">渠道</label>
              <Select
                value={searchParams.channel?.toString() || "all"}
                onValueChange={(value) =>
                  setSearchParams({ ...searchParams, channel: value ? (Number.parseInt(value) as 1 | 2) : "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择渠道" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="1">短信</SelectItem>
                  <SelectItem value="2">邮件</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                重置
              </Button>
            </div>
          </div>

          {/* 操作区域 */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新增供应商
            </Button>
          </div>

          {/* 表格 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">ID</TableHead>
                  <TableHead className="w-[15%]">供应商名称</TableHead>
                  <TableHead className="w-[10%]">渠道</TableHead>
                  <TableHead className="w-[8%]">权重</TableHead>
                  <TableHead className="w-[10%]">QPS限流</TableHead>
                  <TableHead className="w-[10%]">每日限流</TableHead>
                  <TableHead className="w-[10%]">状态</TableHead>
                  <TableHead className="w-[15%]">创建时间</TableHead>
                  <TableHead className="w-[14%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <div className="mt-2">加载中...</div>
                    </TableCell>
                  </TableRow>
                ) : providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-mono text-xs">{provider.id}</TableCell>
                      <TableCell className="font-medium" title={provider.provider_name}>
                        <div className="truncate max-w-[120px]">{provider.provider_name}</div>
                      </TableCell>
                      <TableCell>{getChannelBadge(provider.channel)}</TableCell>
                      <TableCell>{provider.weight}</TableCell>
                      <TableCell>{provider.qps_limit}</TableCell>
                      <TableCell>{provider.daily_limit}</TableCell>
                      <TableCell>{getStatusBadge(provider.active_status)}</TableCell>
                      <TableCell className="text-xs" title={provider.created_at}>
                        {provider.created_at ? provider.created_at.split(" ")[0] : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(provider)} title="查看详情">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(provider)}
                            title={provider.active_status === "active" ? "禁用" : "启用"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(provider)} title="删除">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {total > 0 && (
            <CustomPagination current={currentPage} total={total} pageSize={pageSize} onChange={handlePageChange} />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertAction === "delete" ? "确认删除" : "确认操作"}</AlertDialogTitle>
            <AlertDialogDescription>
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
            <AlertDialogCancel disabled={actionLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
