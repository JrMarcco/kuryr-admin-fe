"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { businessApi, type Operator, type Business } from "@/lib/business-api"
import { useToast } from "@/hooks/use-toast"

interface OperatorsModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
}

export default function OperatorsModal({ isOpen, onClose, business }: OperatorsModalProps) {
  const [operators, setOperators] = useState<Operator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchOperators = useCallback(async () => {
    if (!business) return
    setIsLoading(true)
    try {
      const data = await businessApi.getOperators(business.id)
      setOperators(data)
    } catch (error) {
      console.error("Failed to fetch operators:", error)
      toast({
        title: "获取操作员列表失败",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [business, toast])

  useEffect(() => {
    if (isOpen) {
      fetchOperators()
    }
  }, [isOpen, fetchOperators])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>操作员列表 - {business.name}</DialogTitle>
          <DialogDescription>以下是与此业务关联的所有操作员。</DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : operators.length > 0 ? (
                operators.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>{op.id}</TableCell>
                    <TableCell>{op.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{op.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={op.status === 1 ? "default" : "destructive"}
                        className={
                          op.status === 1
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {op.status === 1 ? "正常" : "禁用"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    暂无操作员
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
