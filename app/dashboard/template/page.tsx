"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/breadcrumb"
import { Pagination } from "@/components/pagination"
import { Eye, Trash2, Plus, Search, Loader2 } from "lucide-react"
import { templateApi, type Template, type TemplateListRequest } from "@/lib/template-api"
import { useToast } from "@/hooks/use-toast"
import { formatTimestamp } from "@/lib/utils"

export default function TemplatePage() {

  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)

  // 搜索条件
  const [searchParams, setSearchParams] = useState<TemplateListRequest>({
    offset: 0,
    limit: 20,
    channel: 0
  })

  const breadcrumbItems = [
    { label: "仪表板", href: "/dashboard" },
    { label: "模板管理", href: "/dashboard/template" },
  ]

  const fetchTemplates = async (page = currentPage) => {
    setLoading(true)
  }

  useEffect(() => {
    fetchTemplates(1).then(() => {})
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTemplates(1).then(() => {})
  }
  
  const handleReset = () => {
    setSearchParams({
      offset: 0,
      limit: 20,
      channel: 0
    })
    setCurrentPage(1)
    setTimeout(() => {
      fetchTemplates(1).then(() => {})
    }, 0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTemplates(page).then(() => {})
  }

  const handleCreate = () => {
    //TODO: 新增模板
    console.log("handleCreate")
  }

  return (
    <div className="w-full p-6 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <Breadcrumb items={breadcrumbItems}/>

      <Card className="border-0 shadow-2xl bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 bg-gray-800">
          <CardTitle className="text-xl font-semibold text-white">模板管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-gray-800">
          {/* 搜索区域 */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 rounded-lg border border-gray-600">
            <div className="flex flex-wrap gap-4 items-end">
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
              新增模板
            </Button>
          </div>

          {/* 表格 */}
          <div className="border border-gray-600 rounded-xl shadow-lg overflow-hidden bg-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">ID</TableHead>
                  <TableHead className="w-[10%]">模板名称</TableHead>
                  <TableHead className="w-[20%]">模板描述</TableHead>
                  <TableHead className="w-[10%]">所属业务类型</TableHead>
                  <TableHead className="w-[10%]">渠道</TableHead>
                  <TableHead className="w-[10%]">消息类型</TableHead>
                  <TableHead className="w-[10%]">创建时间</TableHead>
                  <TableHead className="w-[10%]">更新时间</TableHead>
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
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono text-xs">{template.id}</TableCell>
                      <TableCell className="font-medium" title={template.tpl_name}>
                        <div className="truncate max-w-[120px] text-white font-semibold">{template.tpl_name}</div>
                      </TableCell>
                      <TableCell className="font-medium" title={template.tpl_desc}>
                        <div className="truncate max-w-[120px] text-white font-semibold">{template.tpl_desc}</div>
                      </TableCell>
                      <TableCell className="font-medium" title={template.owner_type}>
                        <Badge
                            className={template.owner_type === "organization"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                              : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm"}
                          >
                          {template.owner_type === "organization" ? "🏢 组织" : "👤 个人"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={template.channel === 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                          : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm"}>
                          {template.channel === 1 ? "📱 短信" : "📧 邮件"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium" title={template.notification_type === 0 ? "验证码" : "通知"}>
                        <Badge className={template.notification_type === 0
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm"
                          : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm"}>
                          {template.notification_type === 0 ? "验证码" : "通知"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-300" title={formatTimestamp(template.created_at)}>
                        {formatTimestamp(template.created_at).split(" ")[0]}
                      </TableCell>
                      <TableCell className="text-xs text-gray-300" title={formatTimestamp(template.updated_at)}>
                        {formatTimestamp(template.updated_at).split(" ")[0]}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => {}} title="查看详情"
                                className="text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                          <Eye className="h-4 w-4"/>
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
    </div>
  )
}
