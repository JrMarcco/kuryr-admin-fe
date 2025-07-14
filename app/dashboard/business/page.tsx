"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Edit, Trash2, Eye, EyeOff, Users } from "lucide-react"
import { OperatorsModal } from "@/components/operators-modal"

interface Business {
  id: string
  name: string
  key: string
  secret: string
  operator: string
  createdAt: string
  updatedAt: string
}

export default function BusinessManagePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    secret: "",
    operator: "",
  })

  const [operatorsModal, setOperatorsModal] = useState({
    isOpen: false,
    businessId: "",
    businessName: "",
  })

  // 模拟数据
  useEffect(() => {
    const mockData: Business[] = [
      {
        id: "1",
        name: "电商平台",
        key: "ecommerce_platform",
        secret: "sk_ecommerce_123456789abcdef",
        operator: "张三",
        createdAt: "2024-01-15 10:30:00",
        updatedAt: "2024-01-20 14:20:00",
      },
      {
        id: "2",
        name: "用户服务",
        key: "user_service",
        secret: "sk_user_987654321fedcba",
        operator: "李四",
        createdAt: "2024-01-10 09:15:00",
        updatedAt: "2024-01-18 16:45:00",
      },
    ]
    setBusinesses(mockData)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toLocaleString("zh-CN")

    if (editingBusiness) {
      // 编辑
      setBusinesses((prev) =>
        prev.map((business) =>
          business.id === editingBusiness.id ? { ...business, ...formData, updatedAt: now } : business,
        ),
      )
    } else {
      // 新增
      const newBusiness: Business = {
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      }
      setBusinesses((prev) => [...prev, newBusiness])
    }

    resetForm()
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setFormData({
      name: business.name,
      key: business.key,
      secret: business.secret,
      operator: business.operator,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个业务方吗？")) {
      setBusinesses((prev) => prev.filter((business) => business.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({ name: "", key: "", secret: "", operator: "" })
    setEditingBusiness(null)
    setIsDialogOpen(false)
  }

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const maskSecret = (secret: string) => {
    return secret.substring(0, 8) + "*".repeat(secret.length - 8)
  }

  const handleViewOperators = (business: Business) => {
    setOperatorsModal({
      isOpen: true,
      businessId: business.id,
      businessName: business.name,
    })
  }

  const closeOperatorsModal = () => {
    setOperatorsModal({
      isOpen: false,
      businessId: "",
      businessName: "",
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">业务方管理</h1>
          <p className="text-gray-400 mt-1">管理消息中心的业务方配置</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              新增业务方
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{editingBusiness ? "编辑业务方" : "新增业务方"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingBusiness ? "修改业务方信息" : "添加新的业务方配置"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    业务名
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="请输入业务名"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key" className="text-gray-300">
                    业务Key
                  </Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="请输入业务Key"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret" className="text-gray-300">
                    业务Secret
                  </Label>
                  <Input
                    id="secret"
                    value={formData.secret}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secret: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="请输入业务Secret"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator" className="text-gray-300">
                    操作员
                  </Label>
                  <Input
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => setFormData((prev) => ({ ...prev, operator: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="请输入操作员"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  取消
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                  {editingBusiness ? "更新" : "创建"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">总业务方数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{businesses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">活跃业务方</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{businesses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">今日新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">业务方列表</CardTitle>
          <CardDescription className="text-gray-400">管理所有业务方的配置信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">业务名</TableHead>
                <TableHead className="text-gray-300">业务Key</TableHead>
                <TableHead className="text-gray-300">业务Secret</TableHead>
                <TableHead className="text-gray-300">操作员管理</TableHead>
                <TableHead className="text-gray-300">创建时间</TableHead>
                <TableHead className="text-gray-300">更改时间</TableHead>
                <TableHead className="text-gray-300">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-white font-medium">{business.name}</TableCell>
                  <TableCell className="text-gray-300">
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                      {business.key}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {showSecrets[business.id] ? business.secret : maskSecret(business.secret)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSecretVisibility(business.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        {showSecrets[business.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOperators(business)}
                      className="text-orange-400 hover:text-orange-300 hover:bg-gray-800"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      查看操作员
                    </Button>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">{business.createdAt}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{business.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
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
