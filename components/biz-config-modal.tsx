"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Edit } from "lucide-react"
import { businessApi } from "@/lib/business-api"
import { useToast } from "@/hooks/use-toast"

interface BizConfig {
  rate_limit: {
    qps: number
    daily_limit: number
    monthly_limit: number
    enable_rate_limit: boolean
  }
  channel_config: {
    sms_enabled: boolean
    email_enabled: boolean
    default_channel: "sms" | "email"
    sms_template_id: string
    email_template_id: string
  }
  quota_config: {
    quota_limit: number
    quota_reset_period: "daily" | "weekly" | "monthly" | "yearly"
    quota_alert_threshold: number
    enable_quota_alert: boolean
  }
  callback_config: {
    enable_callback: boolean
    callback_url: string
    callback_secret: string
    callback_timeout: number
  }
}

interface BizConfigModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: number
  businessName: string
}

export function BizConfigModal({ isOpen, onClose, businessId, businessName }: BizConfigModalProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<BizConfig>({
    rate_limit: {
      qps: 10,
      daily_limit: 10000,
      monthly_limit: 300000,
      enable_rate_limit: true,
    },
    channel_config: {
      sms_enabled: true,
      email_enabled: true,
      default_channel: "sms",
      sms_template_id: "",
      email_template_id: "",
    },
    quota_config: {
      quota_limit: 100000,
      quota_reset_period: "monthly",
      quota_alert_threshold: 80,
      enable_quota_alert: true,
    },
    callback_config: {
      enable_callback: false,
      callback_url: "",
      callback_secret: "",
      callback_timeout: 5000,
    },
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState("rate_limit")

  useEffect(() => {
    if (isOpen && businessId) {
      fetchConfig()
    }
  }, [isOpen, businessId])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      const response = await businessApi.getConfig(businessId)
      if (response.code === 200 && response.data) {
        setConfig(response.data)
      } else {
        toast({
          title: "获取配置失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取配置失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await businessApi.updateConfig(businessId, config)
      if (response.code === 200) {
        toast({
          title: "保存成功",
          description: "配置已更新",
        })
        setEditMode(false)
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

  const updateConfig = (section: keyof BizConfig, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>{businessName} - 业务配置</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
              disabled={loading}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              {editMode ? "取消编辑" : "编辑配置"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="rate_limit" className="data-[state=active]:bg-gray-700">
                限流配置
              </TabsTrigger>
              <TabsTrigger value="channel_config" className="data-[state=active]:bg-gray-700">
                渠道配置
              </TabsTrigger>
              <TabsTrigger value="quota_config" className="data-[state=active]:bg-gray-700">
                配额配置
              </TabsTrigger>
              <TabsTrigger value="callback_config" className="data-[state=active]:bg-gray-700">
                回调配置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rate_limit" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">QPS限制</Label>
                  <Input
                    type="number"
                    value={config.rate_limit.qps}
                    onChange={(e) => updateConfig("rate_limit", "qps", Number.parseInt(e.target.value) || 0)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">每日限制</Label>
                  <Input
                    type="number"
                    value={config.rate_limit.daily_limit}
                    onChange={(e) => updateConfig("rate_limit", "daily_limit", Number.parseInt(e.target.value) || 0)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">每月限制</Label>
                <Input
                  type="number"
                  value={config.rate_limit.monthly_limit}
                  onChange={(e) => updateConfig("rate_limit", "monthly_limit", Number.parseInt(e.target.value) || 0)}
                  disabled={!editMode}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.rate_limit.enable_rate_limit}
                  onCheckedChange={(checked) => updateConfig("rate_limit", "enable_rate_limit", checked)}
                  disabled={!editMode}
                />
                <Label className="text-gray-300">启用限流</Label>
              </div>
            </TabsContent>

            <TabsContent value="channel_config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.channel_config.sms_enabled}
                    onCheckedChange={(checked) => updateConfig("channel_config", "sms_enabled", checked)}
                    disabled={!editMode}
                  />
                  <Label className="text-gray-300">启用短信</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.channel_config.email_enabled}
                    onCheckedChange={(checked) => updateConfig("channel_config", "email_enabled", checked)}
                    disabled={!editMode}
                  />
                  <Label className="text-gray-300">启用邮件</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">默认渠道</Label>
                <Select
                  value={config.channel_config.default_channel}
                  onValueChange={(value) => updateConfig("channel_config", "default_channel", value)}
                  disabled={!editMode}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="sms">短信</SelectItem>
                    <SelectItem value="email">邮件</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">短信模板ID</Label>
                  <Input
                    value={config.channel_config.sms_template_id}
                    onChange={(e) => updateConfig("channel_config", "sms_template_id", e.target.value)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">邮件模板ID</Label>
                  <Input
                    value={config.channel_config.email_template_id}
                    onChange={(e) => updateConfig("channel_config", "email_template_id", e.target.value)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quota_config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">配额限制</Label>
                  <Input
                    type="number"
                    value={config.quota_config.quota_limit}
                    onChange={(e) => updateConfig("quota_config", "quota_limit", Number.parseInt(e.target.value) || 0)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">重置周期</Label>
                  <Select
                    value={config.quota_config.quota_reset_period}
                    onValueChange={(value) => updateConfig("quota_config", "quota_reset_period", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                      <SelectItem value="yearly">每年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">告警阈值 (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.quota_config.quota_alert_threshold}
                  onChange={(e) =>
                    updateConfig("quota_config", "quota_alert_threshold", Number.parseInt(e.target.value) || 0)
                  }
                  disabled={!editMode}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.quota_config.enable_quota_alert}
                  onCheckedChange={(checked) => updateConfig("quota_config", "enable_quota_alert", checked)}
                  disabled={!editMode}
                />
                <Label className="text-gray-300">启用配额告警</Label>
              </div>
            </TabsContent>

            <TabsContent value="callback_config" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.callback_config.enable_callback}
                  onCheckedChange={(checked) => updateConfig("callback_config", "enable_callback", checked)}
                  disabled={!editMode}
                />
                <Label className="text-gray-300">启用回调</Label>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">回调地址</Label>
                <Textarea
                  value={config.callback_config.callback_url}
                  onChange={(e) => updateConfig("callback_config", "callback_url", e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">回调密钥</Label>
                  <Input
                    value={config.callback_config.callback_secret}
                    onChange={(e) => updateConfig("callback_config", "callback_secret", e.target.value)}
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">超时时间 (ms)</Label>
                  <Input
                    type="number"
                    value={config.callback_config.callback_timeout}
                    onChange={(e) =>
                      updateConfig("callback_config", "callback_timeout", Number.parseInt(e.target.value) || 0)
                    }
                    disabled={!editMode}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
          >
            关闭
          </Button>
          {editMode && (
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
