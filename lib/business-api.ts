import { api, type ApiResponse } from "./api"

interface Operator {
  id: string
  username: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Business {
  id: string
  biz_name: string
  biz_key: string
  biz_secret: string
  biz_type: "individual" | "organization"
  contact: string
  contact_email: string
  created_at: number
  updated_at: number
}

interface BusinessListResponse {
  total: number
  records: Business[]
}

export interface BusinessListRequest {
  offset: number
  limit: number
  biz_name?: string
}

export interface CreateBusinessRequest {
  biz_key: string
  biz_name: string
  biz_type: "individual" | "organization"
  contact: string
  contact_email: string
}

interface UpdateBusinessRequest extends CreateBusinessRequest {
  id: string
}

export const businessApi = {
  // 获取业务方列表（分页）
  async getBusinessList(params: BusinessListRequest): Promise<ApiResponse<BusinessListResponse>> {
    const searchParams = new URLSearchParams({
      offset: params.offset.toString(),
      limit: params.limit.toString(),
    })

    if (params.biz_name) {
      searchParams.append('biz_name', params.biz_name)
    }

    return api.get<BusinessListResponse>(`/v1/biz/search?${searchParams.toString()}`)
  },

  // 创建业务方
  async createBusiness(business: CreateBusinessRequest): Promise<ApiResponse<Business>> {
    return api.post<Business>("/v1/biz/save", business)
  },

  // 更新业务方
  async updateBusiness(business: UpdateBusinessRequest): Promise<ApiResponse<Business>> {
    return api.put<Business>(`/v1/biz/${business.id}`, business)
  },

  // 删除业务方
  async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/v1/biz/${id}`)
  },

  // 获取业务方操作员列表
  async getOperators(businessId: string): Promise<ApiResponse<Operator[]>> {
    return api.post<Operator[]>("/v1/user/operators", { businessId })
  },
}
