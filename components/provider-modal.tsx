"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { providerApi, type Provider, type ProviderSaveParams } from "@/lib/provider-api"
import { useToast } from "@/hooks/use-toast"

interface ProviderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId?: number
  mode: "view" | "create" | "edit"
  onSuccess?: () => void
}

export function ProviderModal({ open, onOpenChange, providerId, mode, onSuccess }: ProviderModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [formData, setFormData] = useState<Partial<Provider>>({
    provider_name: "",
    channel: 1,
    weight: 1,
    qps_limit: 100,
    daily_limit: 10000,
    active_status: "active",
    endpoint: "",
    region_id: "",
    app_id: "",
    api_key: "",
    api_secret: "",
    audit_callback_url: "",
  })

  const isReadOnly = mode === "view"
  const isCreate = mode === "create"

  // 获取供应商详情
  useEffect(() => {
    if (open && providerId && !isCreate) {
      fetchProviderDetail()
    } else if (open && isCreate) {
      // 重置表单数据
      setFormData({
        provider_name: "",
        channel: 1,
        weight: 1,
        qps_limit: 100,
        daily_limit: 10000,
        active_status: "active",
        endpoint: "",
        region_id: "",
        app_id: "",
        api_key: "",
        api_secret: "",
        audit_callback_url: "",
      })
    }
  }, [open, providerId, isCreate])

  const fetchProviderDetail = async () => {
    if (!providerId) return

    setLoading(true)
    try {
      const response = await providerApi.getDetail(providerId)
      if (response.code === 200 && response.data) {
        setFormData(response.data)
      } else {
        toast({
          title: "获取供应商详情失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取供应商详情失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // 表单验证
    if (!formData.provider_name?.trim()) {
      toast({
        title: "请输入供应商名称",
        variant: "destructive",
      })
      return
    }

    if (!formData.endpoint?.trim()) {
      toast({
        title: "请输入接口地址",
        variant: "destructive",
      })
      return
    }

    if (!formData.api_key?.trim()) {
      toast({
        title: "请输入接口Key",
        variant: "destructive",
      })
      return
    }

    if (!formData.api_secret?.trim()) {
      toast({
        title: "请输入接口Secret",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const saveData: ProviderSaveParams = {
        provider_name: formData.provider_name!,
        channel: formData.channel!,
        weight: formData.weight!,
        qps_limit: formData.qps_limit!,
        daily_limit: formData.daily_limit!,
        active_status: formData.active_status!,
        endpoint: formData.endpoint!,
        region_id: formData.region_id || "",
        app_id: formData.app_id || "",
        api_key: formData.api_key!,
        api_secret: formData.api_secret!,
        audit_callback_url: formData.audit_callback_url || "",
      }

      const response = await providerApi.save(saveData)
      if (response.code === 200) {
        toast({
          title: "保存成功",
          description: isCreate ? "供应商创建成功" : "供应商更新成功",
        })
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "保存失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "view":
        return "查看供应商详情"
      case "create":
        return "新增供应商"
      case "edit":
        return "编辑供应商"
      default:
        return "供应商信息"
    }
  }

  const getChannelText = (channel: 1 | 2) => {
    return channel === 1 ? "短信" : "邮件"
  }

  const getStatusText = (status: "active" | "inactive") => {
    return status === "active" ? "启用" : "禁用"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === "view" && "查看供应商的详细信息"}
            {mode === "create" && "填写供应商信息并保存"}
            {mode === "edit" && "修改供应商信息并保存"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider_name">供应商名称 *</Label>
                <Input
                  id="provider_name"
                  value={formData.provider_name || ""}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="请输入供应商名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">渠道 *</Label>
                {isReadOnly ? (
                  <Input value={getChannelText(formData.channel!)} disabled />
                ) : (
                  <Select
                    value={formData.channel?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, channel: Number.parseInt(value) as 1 | 2 })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择渠道" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">短信</SelectItem>
                      <SelectItem value="2">邮件</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">权重</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: Number.parseInt(e.target.value) || 1 })}
                  disabled={isReadOnly}
                  placeholder="权重"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qps_limit">QPS限流</Label>
                <Input
                  id="qps_limit"
                  type="number"
                  min="1"
                  value={formData.qps_limit || ""}
                  onChange={(e) => setFormData({ ...formData, qps_limit: Number.parseInt(e.target.value) || 100 })}
                  disabled={isReadOnly}
                  placeholder="QPS限流"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_limit">每日限流</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  min="1"
                  value={formData.daily_limit || ""}
                  onChange={(e) => setFormData({ ...formData, daily_limit: Number.parseInt(e.target.value) || 10000 })}
                  disabled={isReadOnly}
                  placeholder="每日限流"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="active_status">状态</Label>
                {isReadOnly ? (
                  <Input value={getStatusText(formData.active_status!)} disabled />
                ) : (
                  <Select
                    value={formData.active_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, active_status: value as "active" | "inactive" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region_id">区域ID</Label>
                <Input
                  id="region_id"
                  value={formData.region_id || ""}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="区域ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">接口地址 *</Label>
              <Input
                id="endpoint"
                value={formData.endpoint || ""}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                disabled={isReadOnly}
                placeholder="请输入接口地址"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app_id">应用ID</Label>
                <Input
                  id="app_id"
                  value={formData.app_id || ""}
                  onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="应用ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">接口Key *</Label>
                <Input
                  id="api_key"
                  value={formData.api_key || ""}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="请输入接口Key"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_secret">接口Secret *</Label>
              <div className="relative">
                <Input
                  id="api_secret"
                  type={showApiSecret ? "text" : "password"}
                  value={formData.api_secret || ""}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="请输入接口Secret"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  disabled={isReadOnly}
                >
                  {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audit_callback_url">回调地址</Label>
              <Textarea
                id="audit_callback_url"
                value={formData.audit_callback_url || ""}
                onChange={(e) => setFormData({ ...formData, audit_callback_url: e.target.value })}
                disabled={isReadOnly}
                placeholder="回调地址"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? "关闭" : "取消"}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
