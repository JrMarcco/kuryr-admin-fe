"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { businessApi } from "@/lib/business-api"
import { formatTimestamp } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Operator {
  id: number
  operator_name: string
  operator_email: string
  operator_phone: string
  role: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

interface OperatorsModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: number
  businessName: string
}

export function OperatorsModal({ isOpen, onClose, businessId, businessName }: OperatorsModalProps) {
  const { toast } = useToast()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && businessId) {
      fetchOperators()
    }
  }, [isOpen, businessId])

  const fetchOperators = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      const response = await businessApi.getOperators(businessId)
      if (response.code === 200 && response.data) {
        setOperators(response.data)
      } else {
        toast({
          title: "获取操作员列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取操作员列表失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge>管理员</Badge>
      case "operator":
        return <Badge variant="secondary">操作员</Badge>
      case "viewer":
        return <Badge variant="outline">查看者</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: "active" | "inactive") => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>{status === "active" ? "启用" : "禁用"}</Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{businessName} - 操作员列表</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>操作员名称</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无操作员数据
                    </TableCell>
                  </TableRow>
                ) : (
                  operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-mono text-xs">{operator.id}</TableCell>
                      <TableCell>{operator.operator_name}</TableCell>
                      <TableCell>{operator.operator_email}</TableCell>
                      <TableCell>{operator.operator_phone}</TableCell>
                      <TableCell>{getRoleBadge(operator.role)}</TableCell>
                      <TableCell>{getStatusBadge(operator.status)}</TableCell>
                      <TableCell className="text-xs">{formatTimestamp(operator.created_at).split(" ")[0]}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
