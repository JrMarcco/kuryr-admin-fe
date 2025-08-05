"use client"

import type { ApiResponse } from "./api"
import { api } from "./api"

export interface Template {
    id: number
    owner_type: string
    tpl_name: string
    tpl_desc: string
    channel: 1 | 2
    notification_type: 0 | 1
    created_at: number
    updated_at: number
}

export interface TemplateListRequest {
    offset: number
    limit: number
    channel?: 1 | 2 | 0
}

export interface TemplateListResponse {
    records: Template[]
    total: number
}

export const templateApi = {
    // 获取模板列表
    async getList(params: TemplateListRequest): Promise<ApiResponse<TemplateListResponse>> {
        const searchParams = new URLSearchParams()

        if (params.offset) searchParams.append("offset", params.offset.toString())
        if (params.limit) searchParams.append("limit", params.limit.toString())
        if (params.channel) searchParams.append("channel", params.channel.toString())

        const queryString = searchParams.toString()
        const endpoint = `/v1/template/search${queryString ? `?${queryString}` : ""}`

        return api.get<TemplateListResponse>(endpoint)
    }
}