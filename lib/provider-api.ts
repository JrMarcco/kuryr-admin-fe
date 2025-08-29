import { api, type ApiResponse } from "./api"

export interface Provider {
  id: number
  provider_name: string
  channel: 1 | 2 // 1=短信, 2=邮件
  weight: number
  qps_limit: number
  daily_limit: number
  active_status: "active" | "inactive"
  endpoint?: string
  region_id?: string
  app_id?: string
  api_key?: string
  api_secret?: string
  audit_callback_url?: string
  created_at?: string
  updated_at?: string
}

export interface ProviderListRequest {
  offset: number
  limit: number
  provider_name?: string
  channel?: 1 | 2 | 0
}

export interface ProviderListResponse {
  records: Provider[]
}

export interface ProviderSaveParams {
  provider_name: string
  channel: 1 | 2
  weight: number
  qps_limit: number
  daily_limit: number
  active_status: "active" | "inactive"
  endpoint: string
  region_id: string
  app_id: string
  api_key: string
  api_secret: string
  audit_callback_url: string
}

export const providerApi = {
  // 获取供应商列表
  async getList(): Promise<ApiResponse<ProviderListResponse>> {
    return api.get<ProviderListResponse>("/v1/provider/list")
  },

  // 获取供应商详情
  async getDetail(id: number): Promise<ApiResponse<Provider>> {
    return api.get<Provider>(`/v1/provider/find?id=${id}`)
  },

  // 保存供应商
  async save(data: ProviderSaveParams): Promise<ApiResponse> {
    return api.post("/v1/provider/save", data)
  },

  // 更新供应商状态
  async updateStatus(id: number, active_status: "active" | "inactive"): Promise<ApiResponse> {
    return api.put("/v1/provider/update_status", { id, active_status })
  },

  // 删除供应商
  async delete(id: number): Promise<ApiResponse> {
    return api.delete(`/v1/provider/delete?id=${id}`)
  },
}
