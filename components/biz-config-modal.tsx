"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Save, Edit } from "lucide-react"
import { configApi, type BizConfig, type CreateConfigRequest } from "@/lib/config-api"
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
      setFormData({
        biz_id: businessId,
        rate_limit: response.data.rate_limit,
        channel_config: response.data.channel_config,
        quota_config: response.data.quota_config,
        callback_config: response.data.callback_config,
      })
    } else {
      // 如果没有配置，使用默认值
      setConfig(null)
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
      fetchConfig()
      setIsEditing(false)
    }
  }, [isOpen, businessId])

  const handleSave = async () => {
    const response = await executeSaveConfig(formData)

    if (response.code === 200) {
      setConfig(response.data)
      setIsEditing(false)
      // 可以添加成功提示
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
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
                      编辑配置
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

              {/* 配置表单 */}
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
                    <div className="space-y-2">
                      <Label className="text-gray-300">可用渠道</Label>
                      {isEditing ? (
                        <Input
                          value={formData.channel_config.channels.join(", ")}
                          onChange={(e) =>
                            updateFormData(
                              "channel_config.channels",
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s),
                            )
                          }
                          className="bg-black border-gray-700 text-white"
                          placeholder="请输入渠道，用逗号分隔"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.channel_config.channels.length > 0 ? (
                            formData.channel_config.channels.map((channel, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-600/20 text-blue-400 border-blue-600/30"
                              >
                                {channel}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400">暂无配置</span>
                          )}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
