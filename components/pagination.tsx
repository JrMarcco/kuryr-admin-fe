"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

// 临时替换 Select 组件为简单的 select 元素
interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  loading?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading) {
      onPageChange(page)
    }
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!loading) {
      onPageSizeChange(Number.parseInt(event.target.value))
    }
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-400">
          显示 {totalItems > 0 ? startItem : 0} - {endItem} 条，共 {totalItems} 条
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-400">每页显示</p>
          <select
            value={pageSize.toString()}
            onChange={handlePageSizeChange}
            disabled={loading}
            className="h-8 w-16 bg-black border border-gray-900 text-white rounded text-sm px-2 focus:border-orange-500 focus:outline-none"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <p className="text-sm text-gray-400">条</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0 border-gray-900 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <ChevronsLeft className="h-4 w-4"/>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0 border-gray-900 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <ChevronLeft className="h-4 w-4"/>
          </Button>

          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-400">第</span>
            <span className="text-sm text-white font-medium">{currentPage}</span>
            <span className="text-sm text-gray-400">页，共</span>
            <span className="text-sm text-white font-medium">{totalPages}</span>
            <span className="text-sm text-gray-400">页</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0 border-gray-900 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <ChevronRight className="h-4 w-4"/>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0 border-gray-900 text-gray-300 hover:bg-gray-900 bg-black"
          >
            <ChevronsRight className="h-4 w-4"/>
          </Button>
        </div>
      </div>
    </div>
  )
}
