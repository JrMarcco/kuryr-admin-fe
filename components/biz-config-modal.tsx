"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Settings, Save, Edit, Plus, Trash2, Database } from "lucide-react"
import { configApi, type BizConfig, type CreateConfigRequest, type ChannelItem } from "@/lib/config-api"
import { formatTimestamp } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"

interface BizConfigModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
}

export function BizConfigModal({ isOpen, onClose, businessId, businessName }: BizConfigModalProps) {
  const [config, setConfig] = useState<BizConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hasData, setHasData] = useState(false)
  const fetchedRef = useRef<string | null>(null) // 记录已经获取过配置的 businessId
  const [formData, setFormData] = useState<CreateConfigRequest>({
    biz_id: businessId,
    rate_limit: 100,
    channel_config: {
      channels: [],
      retry_policy_config: {
        initial_interval: 1000,
        max_interval: 30000,
        max_retry_times: 3,
      },
    },
    quota_config: {
      daily: {
        sms: 1000,
        email: 5000,
      },
      monthly: {
        sms: 30000,
        email: 150000,
      },
    },
    callback_config: {
      service_name: "",
      retry_policy_config: {
        initial_interval: 1000,
        max_interval: 30000,
        max_retry_times: 3,
      },
    },
  })

  // 获取配置的 API hook
  const { loading: getConfigLoading, error: getConfigError, execute: executeGetConfig } = useApi(configApi.getBizConfig)

  // 保存配置的 API hook
  const {
    loading: saveConfigLoading,
    error: saveConfigError,
    execute: executeSaveConfig,
  } = useApi(configApi.saveBizConfig)

  // 获取配置信息
  const fetchConfig = async () => {
    if (!businessId) return

    const response = await executeGetConfig({ biz_id: businessId })

    if (response.code === 200 && response.data) {
      setConfig(response.data)
      setHasData(true) // 有数据时设置为true，显示表格
      setFormData({
        biz_id: businessId,
        rate_limit: response.data.rate_limit,
        channel_config: response.data.channel_config,
        quota_config: response.data.quota_config,
        callback_config: response.data.callback_config,
      })
    } else {
      // 如果没有配置，不显示表格
      setConfig(null)
      setHasData(false) // 无数据时设置为false，显示空状态
      setFormData({
        biz_id: businessId,
        rate_limit: 100,
        channel_config: {
          channels: [],
          retry_policy_config: {
            initial_interval: 1000,
            max_interval: 30000,
            max_retry_times: 3,
          },
        },
        quota_config: {
          daily: {
            sms: 1000,
            email: 5000,
          },
          monthly: {
            sms: 30000,
            email: 150000,
          },
        },
        callback_config: {
          service_name: "",
          retry_policy_config: {
            initial_interval: 1000,
            max_interval: 30000,
            max_retry_times: 3,
          },
        },
      })
    }
  }

  useEffect(() => {
    if (isOpen && businessId) {
      // 只有当是新的 businessId 或首次打开时才调用接口
      if (fetchedRef.current !== businessId) {
        console.log("调用接口获取配置")
        fetchedRef.current = businessId // 记录当前已获取的 businessId
        fetchConfig() // 打开模态框时立即调用API获取配置
        setIsEditing(false)
        // 不要在这里设置 setHasData(false)，让API响应决定是否有数据
      }
    } else if (!isOpen) {
      // 模态框关闭时重置，以便下次打开时能重新获取数据
      fetchedRef.current = null
    }
  }, [isOpen, businessId])

  const handleSave = async () => {
    const response = await executeSaveConfig(formData)

    if (response.code === 200 && response.data) {
      setConfig(response.data )
      setHasData(true)
      setIsEditing(false)
      // 可以添加成功提示
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setHasData(true) // 点击编辑时显示表格
  }

  const handleCancel = () => {
    if (config) {
      setFormData({
        biz_id: businessId,
        rate_limit: config.rate_limit,
        channel_config: config.channel_config,
        quota_config: config.quota_config,
        callback_config: config.callback_config,
      })
    }
    setIsEditing(false)
  }

  const updateFormData = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".")
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  // 添加渠道
  const addChannel = () => {
    const newChannel: ChannelItem = {
      channel: "sms",
      priority: 1,
      enabled: true,
    }
    updateFormData("channel_config.channels", [...formData.channel_config.channels, newChannel])
  }

  // 删除渠道
  const removeChannel = (index: number) => {
    const newChannels = formData.channel_config.channels.filter((_, i) => i !== index)
    updateFormData("channel_config.channels", newChannels)
  }

  // 更新渠道项
  const updateChannel = (index: number, field: keyof ChannelItem, value: any) => {
    const newChannels = [...formData.channel_config.channels]
    newChannels[index] = { ...newChannels[index], [field]: value }
    updateFormData("channel_config.channels", newChannels)
  }

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Database className="h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">暂无配置数据</h3>
      <p className="text-gray-500 mb-6">该业务方还没有配置信息，点击编辑按钮开始配置</p>
      <Button onClick={handleEdit} className="bg-orange-600 hover:bg-orange-700 text-white">
        <Edit className="mr-2 h-4 w-4" />
        开始配置
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-900 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Settings className="mr-2 h-5 w-5 text-orange-500" />
            {businessName} - 业务方配置
          </DialogTitle>
          <DialogDescription className="text-gray-400">查看和编辑该业务方的配置信息</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {getConfigLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
              <span className="text-gray-400">加载配置中...</span>
            </div>
          ) : (
            <>
              {/* 操作按钮 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                    {businessName}
                  </Badge>
                  <span className="text-gray-400 text-sm">业务方ID: {businessId}</span>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saveConfigLoading}
                        className="border-gray-800 text-gray-300 hover:bg-gray-900 bg-black"
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saveConfigLoading}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {saveConfigLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            保存
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit} className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Edit className="mr-2 h-4 w-4" />
                      {hasData ? "编辑配置" : "开始配置"}
                    </Button>
                  )}
                </div>
              </div>

              {/* 错误提示 */}
              {(getConfigError || saveConfigError) && (
                <div className="bg-red-900/50 border border-red-800 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{getConfigError || saveConfigError}</p>
                </div>
              )}

              {/* 配置表格或空状态 */}
              {!hasData && !isEditing ? (
                renderEmptyState()
              ) : (
                <div className="grid gap-6">
                  {/* 限流阈值 */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">限流阈值</CardTitle>
                      <CardDescription className="text-gray-400">设置每秒最大请求数量</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label className="text-gray-300">限流阈值 (请求/秒)</Label>
                          <Input
                            type="number"
                            value={formData.rate_limit}
                            onChange={(e) => updateFormData("rate_limit", Number.parseInt(e.target.value) || 0)}
                            className="bg-black border-gray-700 text-white"
                            placeholder="请输入限流阈值"
                          />
                        </div>
                      ) : (
                        <div className="text-white">
                          <span className="text-2xl font-bold text-orange-400">{formData.rate_limit}</span>
                          <span className="text-gray-400 ml-2">请求/秒</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 渠道配置 */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">渠道配置</CardTitle>
                      <CardDescription className="text-gray-400">配置可用渠道和重试策略</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 渠道项 */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-gray-300">渠道列表</Label>
                          {isEditing && (
                            <Button
                              onClick={addChannel}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              添加渠道
                            </Button>
                          )}
                        </div>

                        {formData.channel_config.channels.length === 0 ? (
                          <div className="text-gray-400 text-center py-4">
                            {isEditing ? "点击上方按钮添加渠道" : "暂无配置渠道"}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {formData.channel_config.channels.map((channel, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-3 bg-black rounded-lg border border-gray-700"
                              >
                                {isEditing ? (
                                  <>
                                    <div className="flex-1">
                                      <Label className="text-gray-400 text-xs">渠道类型</Label>
                                      <select
                                        value={channel.channel}
                                        onChange={(e) =>
                                          updateChannel(index, "channel", e.target.value as "sms" | "email")
                                        }
                                        className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                                      >
                                        <option value="sms">短信 (SMS)</option>
                                        <option value="email">邮件 (Email)</option>
                                      </select>
                                    </div>
                                    <div className="flex-1">
                                      <Label className="text-gray-400 text-xs">优先级 (1-9)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="9"
                                        value={channel.priority}
                                        onChange={(e) => {
                                          const value = Number.parseInt(e.target.value) || 1
                                          const clampedValue = Math.max(1, Math.min(9, value))
                                          updateChannel(index, "priority", clampedValue)
                                        }}
                                        className="mt-1 bg-gray-800 border-gray-600 text-white"
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <Label className="text-gray-400 text-xs mb-2">启用状态</Label>
                                      <Switch
                                        checked={channel.enabled}
                                        onCheckedChange={(checked) => updateChannel(index, "enabled", checked)}
                                      />
                                    </div>
                                    <Button
                                      onClick={() => removeChannel(index)}
                                      size="sm"
                                      variant="destructive"
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1">
                                      <Badge
                                        variant="secondary"
                                        className={
                                          channel.channel === "sms"
                                            ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                                            : "bg-green-600/20 text-green-400 border-green-600/30"
                                        }
                                      >
                                        {channel.channel === "sms" ? "短信" : "邮件"}
                                      </Badge>
                                    </div>
                                    <div className="flex-1 text-white">
                                      优先级: <span className="text-orange-400 font-bold">{channel.priority}</span>
                                    </div>
                                    <div className="flex-1">
                                      <Badge
                                        variant={channel.enabled ? "default" : "secondary"}
                                        className={
                                          channel.enabled
                                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                                            : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                                        }
                                      >
                                        {channel.enabled ? "已启用" : "已禁用"}
                                      </Badge>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 重试策略 */}
                      <div className="space-y-3">
                        <Label className="text-gray-300">重试策略配置</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">初始重试间隔 (毫秒)</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.channel_config.retry_policy_config.initial_interval}
                                onChange={(e) =>
                                  updateFormData(
                                    "channel_config.retry_policy_config.initial_interval",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.channel_config.retry_policy_config.initial_interval}ms
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">最大重试间隔 (毫秒)</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.channel_config.retry_policy_config.max_interval}
                                onChange={(e) =>
                                  updateFormData(
                                    "channel_config.retry_policy_config.max_interval",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.channel_config.retry_policy_config.max_interval}ms
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">最大重试次数</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.channel_config.retry_policy_config.max_retry_times}
                                onChange={(e) =>
                                  updateFormData(
                                    "channel_config.retry_policy_config.max_retry_times",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.channel_config.retry_policy_config.max_retry_times}次
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 配额配置 */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">配额配置</CardTitle>
                      <CardDescription className="text-gray-400">设置短信和邮件的日配额和月配额</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 日配额 */}
                      <div className="space-y-3">
                        <Label className="text-gray-300">日配额</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">短信日配额</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.quota_config.daily.sms}
                                onChange={(e) =>
                                  updateFormData("quota_config.daily.sms", Number.parseInt(e.target.value) || 0)
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">{formData.quota_config.daily.sms.toLocaleString()}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">邮件日配额</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.quota_config.daily.email}
                                onChange={(e) =>
                                  updateFormData("quota_config.daily.email", Number.parseInt(e.target.value) || 0)
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">{formData.quota_config.daily.email.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 月配额 */}
                      <div className="space-y-3">
                        <Label className="text-gray-300">月配额</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">短信月配额</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.quota_config.monthly.sms}
                                onChange={(e) =>
                                  updateFormData("quota_config.monthly.sms", Number.parseInt(e.target.value) || 0)
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">{formData.quota_config.monthly.sms.toLocaleString()}</div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">邮件月配额</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.quota_config.monthly.email}
                                onChange={(e) =>
                                  updateFormData("quota_config.monthly.email", Number.parseInt(e.target.value) || 0)
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">{formData.quota_config.monthly.email.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 回调配置 */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">回调配置</CardTitle>
                      <CardDescription className="text-gray-400">配置回调服务和重试策略</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 服务名 */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">服务名</Label>
                        {isEditing ? (
                          <Input
                            value={formData.callback_config.service_name}
                            onChange={(e) => updateFormData("callback_config.service_name", e.target.value)}
                            className="bg-black border-gray-700 text-white"
                            placeholder="请输入服务名"
                          />
                        ) : (
                          <div className="text-white">{formData.callback_config.service_name || "未配置"}</div>
                        )}
                      </div>

                      {/* 重试策略 */}
                      <div className="space-y-3">
                        <Label className="text-gray-300">重试策略配置</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">初始重试间隔 (毫秒)</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.callback_config.retry_policy_config.initial_interval}
                                onChange={(e) =>
                                  updateFormData(
                                    "callback_config.retry_policy_config.initial_interval",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.callback_config.retry_policy_config.initial_interval}ms
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">最大重试间隔 (毫秒)</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.callback_config.retry_policy_config.max_interval}
                                onChange={(e) =>
                                  updateFormData(
                                    "callback_config.retry_policy_config.max_interval",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.callback_config.retry_policy_config.max_interval}ms
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">最大重试次数</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={formData.callback_config.retry_policy_config.max_retry_times}
                                onChange={(e) =>
                                  updateFormData(
                                    "callback_config.retry_policy_config.max_retry_times",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className="bg-black border-gray-700 text-white"
                              />
                            ) : (
                              <div className="text-white">
                                {formData.callback_config.retry_policy_config.max_retry_times}次
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 时间信息 */}
                  {config && (
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">时间信息</CardTitle>
                        <CardDescription className="text-gray-400">配置的创建和更新时间</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">创建时间</Label>
                            <div className="text-white">{formatTimestamp(config.created_at)}</div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-400 text-sm">更新时间</Label>
                            <div className="text-white">{formatTimestamp(config.updated_at)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
