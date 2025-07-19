import { api, type ApiResponse } from "./api"

interface Operator {
  id: string
  username: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface Business {
  id: string
  biz_name: string
  biz_key: string
  biz_secret: string
  contact: string
  contact_email: string
  created_at: number
  updated_at: number
}

interface BusinessListResponse {
  total: number
  content: Business[]
}

interface BusinessListRequest {
  offset: number
  limit: number
}

interface CreateBusinessRequest {
  biz_name: string
  biz_key: string
  contact: string
  contact_email: string
}

interface UpdateBusinessRequest extends CreateBusinessRequest {
  id: string
}

export const businessApi = {
  // 获取业务方列表（分页）
  async getBusinessList(params: BusinessListRequest): Promise<ApiResponse<BusinessListResponse>> {
    return api.get<BusinessListResponse>(`/v1/biz/list?offset=${params.offset}&limit=${params.limit}`)
  },

  // 创建业务方
  async createBusiness(business: CreateBusinessRequest): Promise<ApiResponse<Business>> {
    return api.post<Business>("/v1/biz/create", business)
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
