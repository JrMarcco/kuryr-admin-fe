import { api, type ApiResponse } from "./api"

interface BizConfig {
  id: string
  biz_id: string
  config_key: string
  config_value: string
  config_desc: string
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
  config_key: string
  config_value: string
  config_desc: string
}

interface UpdateConfigRequest extends CreateConfigRequest {
  id: string
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

export type { BizConfig, ConfigListResponse, ConfigListRequest, CreateConfigRequest, UpdateConfigRequest }
