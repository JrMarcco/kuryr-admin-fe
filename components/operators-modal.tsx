"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"
import { businessApi } from "@/lib/business-api"

interface Operator {
  id: string
  username: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface OperatorsModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
}

export function OperatorsModal({ isOpen, onClose, businessId, businessName }: OperatorsModalProps) {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchOperators = async () => {
    if (!businessId) return

    setLoading(true)
    setError("")

    try {
      const response = await businessApi.getOperators(businessId)

      if (response.success && response.data) {
        setOperators(response.data)
      } else {
        setError(response.message || "获取操作员列表失败")
        // 模拟数据作为后备
        setOperators([])
      }
    } catch (error) {
      console.error("Fetch operators error:", error)
      setError("网络错误，请稍后重试")
      // 模拟数据作为后备
      setOperators([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && businessId) {
      fetchOperators()
    }
  }, [isOpen, businessId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <User className="mr-2 h-5 w-5 text-orange-500" />
            {businessName} - 操作员列表
          </DialogTitle>
          <DialogDescription className="text-gray-400">查看该业务方下的所有操作员信息</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
              <span className="text-gray-400">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">{error}</div>
              <div className="text-gray-500 text-sm">显示模拟数据</div>
            </div>
          ) : operators.length === 0 ? (
            <div className="text-center py-8 text-gray-400">该业务方暂无操作员</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">共 {operators.length} 个操作员</div>
                <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                  {businessName}
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">用户名</TableHead>
                    <TableHead className="text-gray-300">姓名</TableHead>
                    <TableHead className="text-gray-300">邮箱</TableHead>
                    <TableHead className="text-gray-300">创建时间</TableHead>
                    <TableHead className="text-gray-300">更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator) => (
                    <TableRow key={operator.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          {operator.username}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{operator.name}</TableCell>
                      <TableCell className="text-gray-300">{operator.email}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{operator.createdAt}</TableCell>
                      <TableCell className="text-gray-300 text-sm">{operator.updatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
