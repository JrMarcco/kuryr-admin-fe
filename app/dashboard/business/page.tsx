"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Settings, Users, Plus, Search } from "lucide-react"
import { businessApi, type Business } from "@/lib/business-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import { Pagination } from "@/components/pagination"
import { Breadcrumb } from "@/components/breadcrumb"
import { OperatorsModal } from "@/components/operators-modal"
import { BizConfigModal } from "@/components/biz-config-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CreateBusinessForm {
  biz_key: string
  biz_name: string
  biz_type: "individual" | "organization"
  contact: string
  contact_email: string
}

export default function BusinessPage() {
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isOperatorsModalOpen, setIsOperatorsModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [searchType, setSearchType] = useState<"all" | "individual" | "organization">("all")
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
    const params: any = {
      offset,
      limit: pageSize,
    }

    // 添加搜索条件
    if (searchName) {
      params.biz_name = searchName
    }
    if (searchType !== "all") {
      params.biz_type = searchType
    }

    const response = await execute(params)

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
    // 表单验证
    if (!createForm.biz_key?.trim()) {
      toast({
        title: "请输入业务Key",
        variant: "destructive",
      })
      return
    }

    if (!createForm.biz_name?.trim()) {
      toast({
        title: "请输入业务名称",
        variant: "destructive",
      })
      return
    }

    const response = await executeCreate(createForm)

    if (response.code === 200) {
      toast({
        title: "创建成功",
        description: "业务方创建成功",
      })
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
    } else {
      toast({
        title: "创建失败",
        description: response.msg || "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchBusinesses(1).then(() => {})
  }

  const handleReset = () => {
    setSearchName("")
    setSearchType("all")
    setCurrentPage(1)
    setTimeout(() => {
      fetchBusinesses(1).then(() => {})
    }, 0)
  }

  const breadcrumbItems = [
    { label: "仪表板", href: "/dashboard" },
    { label: "业务方管理", href: "/dashboard/business" },
  ]

  return (
    <div className="w-full p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <Card>
        <CardHeader>
          <CardTitle>业务方管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索区域 */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">业务方名称</label>
              <Input
                placeholder="请输入业务方名称"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">业务类型</label>
              <Select
                value={searchType}
                onValueChange={(value) => setSearchType(value as "all" | "individual" | "organization")}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="individual">个人</SelectItem>
                  <SelectItem value="organization">组织</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
              >
                重置
              </Button>
            </div>
          </div>

          {/* 操作区域 */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              共 {totalCount} 条记录，当前第 {currentPage} 页
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增业务方
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* 表格 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">ID</TableHead>
                  <TableHead className="w-[12%]">业务名称</TableHead>
                  <TableHead className="w-[8%]">类型</TableHead>
                  <TableHead className="w-[10%]">联系人</TableHead>
                  <TableHead className="w-[10%]">联系人邮箱</TableHead>
                  <TableHead className="w-[10%]">业务 Key</TableHead>
                  <TableHead className="w-[10%]">业务密钥</TableHead>
                  <TableHead className="w-[10%]">创建时间</TableHead>
                  <TableHead className="w-[10%]">更新时间</TableHead>
                  <TableHead className="w-[12%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <div className="mt-2">加载中...</div>
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-mono text-xs">{business.id}</TableCell>
                      <TableCell className="font-medium" title={business.biz_name}>
                        <div className="truncate max-w-[120px]">{business.biz_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.biz_type === "organization" ? "default" : "secondary"}>
                          {business.biz_type === "organization" ? "组织" : "个人"}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate" title={business.contact}>
                        {business.contact}
                      </TableCell>
                      <TableCell className="truncate" title={business.contact_email}>
                        {business.contact_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="truncate max-w-full" title={business.biz_key}>
                          {business.biz_key}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="truncate font-mono text-xs" title={business.biz_secret}>
                          {business.biz_secret}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs" title={formatTimestamp(business.created_at)}>
                        {formatTimestamp(business.created_at).split(" ")[0]}
                      </TableCell>
                      <TableCell className="text-xs" title={formatTimestamp(business.updated_at)}>
                        {formatTimestamp(business.updated_at).split(" ")[0]}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOperators(business)}
                            title="查看操作员"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleViewConfig(business)} title="查看配置">
                            <Settings className="h-4 w-4" />
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

      {/* 新增业务方模态框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">新增业务方</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="individual">个人</SelectItem>
                  <SelectItem value="organization">组织</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz_key" className="text-gray-300">
                业务Key *
              </Label>
              <Input
                id="biz_key"
                value={createForm.biz_key}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, biz_key: e.target.value }))}
                placeholder="请输入业务Key"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz_name" className="text-gray-300">
                业务名称 *
              </Label>
              <Input
                id="biz_name"
                value={createForm.biz_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, biz_name: e.target.value }))}
                placeholder="请输入业务名称"
                className="bg-gray-800 border-gray-700 text-white"
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
                className="bg-gray-800 border-gray-700 text-white"
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
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            {createError && (
              <div className="bg-red-900/50 border border-red-800 rounded-lg p-3">
                <p className="text-red-300 text-sm">创建失败: {createError}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
            >
              取消
            </Button>
            <Button onClick={handleCreateBusiness} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                "创建"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
