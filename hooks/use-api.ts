"use client"

import { useState, useCallback } from "react"
import type { ApiResponse } from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T>>
  reset: () => void
}

export function useApi<T = any>(apiFunction: (...args: any[]) => Promise<ApiResponse<T>>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await apiFunction(...args)

        if (response.code === 200) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
          })
        } else {
          setState({
            data: null,
            loading: false,
            error: response.msg || "操作失败",
          })
        }

        return response
      } catch (error) {
        const errorMessage = "网络错误，请稍后重试"
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        })

        return {
          code: 500,
          msg: errorMessage,
        }
      }
    },
    [apiFunction],
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
