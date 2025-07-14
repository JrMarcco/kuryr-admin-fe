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
  name: string
  key: string
  secret: string
  operator: string
  createdAt: string
  updatedAt: string
}

interface CreateBusinessRequest {
  name: string
  key: string
  secret: string
  operator: string
}

interface UpdateBusinessRequest extends CreateBusinessRequest {
  id: string
}

export const businessApi = {
  // 获取业务方列表
  async getBusinessList(): Promise<ApiResponse<Business[]>> {
    return api.get<Business[]>("/v1/business/list")
  },

  // 创建业务方
  async createBusiness(business: CreateBusinessRequest): Promise<ApiResponse<Business>> {
    return api.post<Business>("/api/v1/business/create", business)
  },

  // 更新业务方
  async updateBusiness(business: UpdateBusinessRequest): Promise<ApiResponse<Business>> {
    return api.put<Business>(`/api/v1/business/${business.id}`, business)
  },

  // 删除业务方
  async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/v1/business/${id}`)
  },

  // 获取业务方操作员列表
  async getOperators(businessId: string): Promise<ApiResponse<Operator[]>> {
    return api.post<Operator[]>("/api/v1/user/operators", { businessId })
  },
}
