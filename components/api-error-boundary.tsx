"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ApiErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ApiErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ApiErrorBoundary extends React.Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ApiErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("API Error Boundary caught an error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4">
          <Alert className="bg-red-900/50 border-red-800">
            <AlertDescription className="text-red-300">
              <div className="flex items-center justify-between">
                <span>系统出现错误，请稍后重试</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="ml-4 border-red-700 text-red-300 hover:bg-red-800 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  重试
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
