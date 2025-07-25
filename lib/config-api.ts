import { api, type ApiResponse } from "./api"

interface RetryPolicyConfig {
  initial_interval: number // 初始重试间隔（毫秒）
  max_interval: number // 最大重试间隔（毫秒）
  max_retry_times: number // 最大重试次数
}

interface ChannelConfig {
  channels: string[] // 渠道项
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

interface ConfigListResponse {
  total: number
  content: BizConfig[]
}

interface ConfigListRequest {
  offset: number
  limit: number
  biz_id?: string
}

interface CreateConfigRequest {
  biz_id: string
  rate_limit: number
  channel_config: ChannelConfig
  quota_config: QuotaConfig
  callback_config: CallbackConfig
}

interface UpdateConfigRequest extends CreateConfigRequest {
  id: string
}

interface GetConfigRequest {
  biz_id: string
}

export const configApi = {
  // 获取配置列表（分页）
  async getConfigList(params: ConfigListRequest): Promise<ApiResponse<ConfigListResponse>> {
    const queryParams = new URLSearchParams({
      offset: params.offset.toString(),
      limit: params.limit.toString(),
    })

    if (params.biz_id) {
      queryParams.append("biz_id", params.biz_id)
    }

    return api.get<ConfigListResponse>(`/v1/biz_conf/list?${queryParams.toString()}`)
  },

  // 获取业务方配置
  async getBizConfig(params: GetConfigRequest): Promise<ApiResponse<BizConfig>> {
    const queryParams = new URLSearchParams({
      biz_id: params.biz_id,
    })

    return api.get<BizConfig>(`/v1/biz_config/get?${queryParams.toString()}`)
  },

  // 创建或更新业务方配置
  async saveBizConfig(config: CreateConfigRequest): Promise<ApiResponse<BizConfig>> {
    return api.post<BizConfig>("/v1/biz_config/post", config)
  },

  // 创建配置
  async createConfig(config: CreateConfigRequest): Promise<ApiResponse<BizConfig>> {
    return api.post<BizConfig>("/v1/biz_conf/save", config)
  },

  // 更新配置
  async updateConfig(config: UpdateConfigRequest): Promise<ApiResponse<BizConfig>> {
    return api.put<BizConfig>(`/v1/biz_conf/${config.id}`, config)
  },

  // 删除配置
  async deleteConfig(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/v1/biz_conf/${id}`)
  },
}

export type {
  BizConfig,
  ConfigListResponse,
  ConfigListRequest,
  CreateConfigRequest,
  UpdateConfigRequest,
  GetConfigRequest,
  RetryPolicyConfig,
  ChannelConfig,
  QuotaConfig,
  CallbackConfig,
}
