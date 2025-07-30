"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, RotateCcw, Users, Settings, Trash2, FilePenLine, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Pagination from "@/components/pagination"
import OperatorsModal from "@/components/operators-modal"
import BizConfigModal from "@/components/biz-config-modal"
import { businessApi, type Business } from "@/lib/business-api"
import { useToast } from "@/hooks/use-toast"

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOperatorsModalOpen, setIsOperatorsModalOpen] = useState(false)
  const [isBizConfigModalOpen, setIsBizConfigModalOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    appId: "",
    type: "",
    status: 1,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchQuery, setSearchQuery] = useState({ name: "", type: "all" })
  const { toast } = useToast()

  const recordsPerPage = 10

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await businessApi.list({
        page: currentPage,
        limit: recordsPerPage,
        name: searchQuery.name || undefined,
        type: searchQuery.type === "all" ? undefined : searchQuery.type,
      })
      setBusinesses(data.items)
      setTotalRecords(data.total)
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
      toast({
        title: "获取业务方列表失败",
        description: "请稍后重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, toast])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchBusinesses()
  }

  const handleReset = () => {
    setCurrentPage(1)
    setSearchQuery({ name: "", type: "all" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBusiness((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewBusiness((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddBusiness = async () => {
    try {
      await businessApi.create(newBusiness)
      setIsModalOpen(false)
      setNewBusiness({ name: "", appId: "", type: "", status: 1 })
      fetchBusinesses()
      toast({
        title: "成功",
        description: "业务方已成功添加。",
      })
    } catch (error) {
      console.error("Failed to add business:", error)
      toast({
        title: "添加失败",
        description: "无法添加业务方，请检查输入信息。",
        variant: "destructive",
      })
    }
  }

  const openOperatorsModal = (business: Business) => {
    setSelectedBusiness(business)
    setIsOperatorsModalOpen(true)
  }

  const openBizConfigModal = (business: Business) => {
    setSelectedBusiness(business)
    setIsBizConfigModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background text-foreground min-h-full">
      <Card>
        <CardHeader>
          <CardTitle>业务方管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Input
                placeholder="业务方名称"
                value={searchQuery.name}
                onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
                className="w-full sm:w-auto"
              />
              <Select
                value={searchQuery.type}
                onValueChange={(value) => setSearchQuery({ ...searchQuery, type: value })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="业务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="finance">金融</SelectItem>
                  <SelectItem value="e-commerce">电商</SelectItem>
                  <SelectItem value="logistics">物流</SelectItem>
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
            <Button onClick={() => setIsModalOpen(true)} className="ml-auto w-full sm:w-auto flex-shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              新增业务方
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>业务方名称</TableHead>
                  <TableHead>AppID</TableHead>
                  <TableHead>业务类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : businesses.length > 0 ? (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.id}</TableCell>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell>{business.appId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{business.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={business.status === 1 ? "default" : "destructive"}
                          className={
                            business.status === 1
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {business.status === 1 ? "正常" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(business.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openOperatorsModal(business)}>
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openBizConfigModal(business)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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
                    <TableCell colSpan={7} className="text-center">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增业务方</DialogTitle>
            <DialogDescription>请填写以下信息以创建一个新的业务方。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                业务方名称
              </Label>
              <Input
                id="name"
                name="name"
                value={newBusiness.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appId" className="text-right">
                AppID
              </Label>
              <Input
                id="appId"
                name="appId"
                value={newBusiness.appId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                业务类型
              </Label>
              <Select name="type" onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">金融</SelectItem>
                  <SelectItem value="e-commerce">电商</SelectItem>
                  <SelectItem value="logistics">物流</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddBusiness}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedBusiness && (
        <>
          <OperatorsModal
            isOpen={isOperatorsModalOpen}
            onClose={() => setIsOperatorsModalOpen(false)}
            business={selectedBusiness}
          />
          <BizConfigModal
            isOpen={isBizConfigModalOpen}
            onClose={() => setIsBizConfigModalOpen(false)}
            business={selectedBusiness}
          />
        </>
      )}
    </div>
  )
}
