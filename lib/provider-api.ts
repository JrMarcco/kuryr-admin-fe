import { api, type ApiResponse } from "./api"
import { Business } from "@/lib/business-api";

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
  channel?: 1 | 2 | ""
}

export interface ProviderListResponse {
  content: Provider[]
  total: number
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
  async getList(params: ProviderListRequest): Promise<ApiResponse<ProviderListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.offset) searchParams.append("offset", params.offset.toString())
    if (params.limit) searchParams.append("page_size", params.limit.toString())
    if (params.provider_name) searchParams.append("provider_name", params.provider_name)
    if (params.channel) searchParams.append("channel", params.channel.toString())

    const queryString = searchParams.toString()
    const endpoint = `/v1/provider/list${queryString ? `?${queryString}` : ""}`

    return api.get<ProviderListResponse>(endpoint)
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
  async updateStatus(id: number, active_status: "active" | "inactive"): Promise<ApiResponse<any>> {
    return api.put("/v1/provider/update_status", { id, active_status })
  },

  // 删除供应商
  async delete(id: number): Promise<ApiResponse> {
    return api.delete(`/v1/provider/delete?id=${id}`)
  },
}
