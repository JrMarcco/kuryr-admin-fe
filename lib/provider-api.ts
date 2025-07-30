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

export interface ProviderListParams {
  page?: number
  page_size?: number
  provider_name?: string
  channel?: 1 | 2 | ""
}

export interface ProviderListResponse {
  list: Provider[]
  total: number
  page: number
  page_size: number
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
  async getList(params: ProviderListParams = {}): Promise<ApiResponse<ProviderListResponse>> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append("page", params.page.toString())
    if (params.page_size) searchParams.append("page_size", params.page_size.toString())
    if (params.provider_name) searchParams.append("provider_name", params.provider_name)
    if (params.channel) searchParams.append("channel", params.channel.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/v1/provider/list${queryString ? `?${queryString}` : ""}`

    return api.get<ProviderListResponse>(endpoint)
  },

  // 获取供应商详情
  async getDetail(id: number): Promise<ApiResponse<Provider>> {
    return api.get<Provider>(`/api/v1/provider/find?id=${id}`)
  },

  // 保存供应商
  async save(data: ProviderSaveParams): Promise<ApiResponse<any>> {
    return api.post("/api/v1/provider/save", data)
  },

  // 更新供应商状态
  async updateStatus(id: number, active_status: "active" | "inactive"): Promise<ApiResponse<any>> {
    return api.put("/api/v1/provider/update_status", { id, active_status })
  },

  // 删除供应商
  async delete(id: number): Promise<ApiResponse<any>> {
    return api.delete(`/api/v1/provider/delete?id=${id}`)
  },
}
