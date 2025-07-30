"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, RotateCcw, Trash2, FilePenLine, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Pagination from "@/components/pagination"
import ProviderModal from "@/components/provider-modal"
import { providerApi, type Provider } from "@/lib/provider-api"
import { useToast } from "@/hooks/use-toast"

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchQuery, setSearchQuery] = useState({ name: "", type: "all" })
  const { toast } = useToast()

  const recordsPerPage = 10

  const fetchProviders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await providerApi.list({
        page: currentPage,
        limit: recordsPerPage,
        name: searchQuery.name || undefined,
        channel_type: searchQuery.type === "all" ? undefined : searchQuery.type,
      })
      setProviders(data.items)
      setTotalRecords(data.total)
    } catch (error) {
      console.error("Failed to fetch providers:", error)
      toast({
        title: "获取供应商列表失败",
        description: "请稍后重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, toast])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProviders()
  }

  const handleReset = () => {
    setCurrentPage(1)
    setSearchQuery({ name: "", type: "all" })
  }

  const handleAdd = () => {
    setEditingProvider(null)
    setIsModalOpen(true)
  }

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    setIsModalOpen(false)
    fetchProviders()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background text-foreground min-h-full">
      <Card>
        <CardHeader>
          <CardTitle>供应商管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Input
                placeholder="供应商名称"
                value={searchQuery.name}
                onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
                className="w-full sm:w-auto"
              />
              <Select
                value={searchQuery.type}
                onValueChange={(value) => setSearchQuery({ ...searchQuery, type: value })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="渠道类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部渠道</SelectItem>
                  <SelectItem value="sms">短信</SelectItem>
                  <SelectItem value="email">邮件</SelectItem>
                  <SelectItem value="wechat">公众号</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto bg-transparent">
                <RotateCcw className="mr-2 h-4 w-4" />
                重置
              </Button>
            </div>
            <Button onClick={handleAdd} className="ml-auto w-full sm:w-auto flex-shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              新增供应商
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>供应商名称</TableHead>
                  <TableHead>渠道类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : providers.length > 0 ? (
                  providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.id}</TableCell>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{provider.channel_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={provider.status === 1 ? "default" : "destructive"}
                          className={
                            provider.status === 1
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {provider.status === 1 ? "正常" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(provider.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(provider)}>
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">共 {totalRecords} 条记录</div>
            <Pagination
              currentPage={currentPage}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProviderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          provider={editingProvider}
        />
      )}
    </div>
  )
}
