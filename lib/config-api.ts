"use client"

import type { ApiResponse } from "@/lib/api"
import { api } from "./api"

interface RetryPolicyConfig {
  initial_interval: number // 初始重试间隔（毫秒）
  max_interval: number // 最大重试间隔（毫秒）
  max_retry_times: number // 最大重试次数
}

interface ChannelItem {
  channel: 1 | 2 // 渠道类型
  priority: number // 优先级 1-9
  enabled: boolean // 是否启用
}

interface ChannelConfig {
  channels: ChannelItem[] // 渠道项数组
  retry_policy_config: RetryPolicyConfig // 重试策略配置
}

interface QuotaConfig {
  daily: {
    sms: number // 短信日配额
    email: number // 邮件日配额
  }
  monthly: {
    sms: number // 短信月配额
    email: number // 邮件月配额
  }
}

interface CallbackConfig {
  service_name: string // 服务名
  retry_policy_config: RetryPolicyConfig // 重试策略配置
}

interface BizConfig {
  id: string
  biz_id: string
  rate_limit: number // 限流阈值
  channel_config: ChannelConfig // 渠道配置
  quota_config: QuotaConfig // 配额配置
  callback_config: CallbackConfig // 回调配置
  created_at: number
  updated_at: number
}

interface CreateConfigRequest {
  biz_id: string
  rate_limit: number
  channel_config: ChannelConfig
  quota_config: QuotaConfig
  callback_config: CallbackConfig
}

interface GetConfigRequest {
  biz_id: string
}

export const configApi = {
  // 获取业务方配置
  async getBizConfig(params: GetConfigRequest): Promise<ApiResponse<BizConfig>> {
    const queryParams = new URLSearchParams({
      biz_id: params.biz_id,
    })
    return api.get<BizConfig>(`/v1/biz_config/find?${queryParams.toString()}`)
  },

  // 创建或更新业务方配置
  async saveBizConfig(config: CreateConfigRequest): Promise<ApiResponse<BizConfig>> {
    return api.post<BizConfig>("/v1/biz_config/save", config)
  },
}

export type {
  BizConfig,
  CreateConfigRequest,
  GetConfigRequest,
  RetryPolicyConfig,
  ChannelConfig,
  ChannelItem,
  QuotaConfig,
  CallbackConfig,
}
