import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from './types'


/** 租户模型 */
export interface Tenant {
  id: number
  name: string
  code: string
  description: string
  status: number
  domain: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

/** 租户列表响应 */
export type TenantListResponse = BaseResult<{
  list: Tenant[]
  total: number
}>

/** 租户详情响应 */
export type  TenantResponse = BaseResult<Tenant>

// 获取租户列表
export const getTenantList = (params: any) => {
  return http.request<TenantListResponse>("get", baseUrlApi("sysTenant/list"), { params });
}

// 根据ID获取租户信息
export const getTenantById = (id: number) => {
  return http.request<TenantResponse>("get", baseUrlApi(`sysTenant/${id}`))
}

// 新增租户
export const addTenant = (data: Partial<Tenant>) => {
  return http.request<BaseResult>("post", baseUrlApi("sysTenant/add"), { data });
}

// 更新租户
export const updateTenant = (data: Partial<Tenant>) => {
  return http.request<BaseResult>("put", baseUrlApi("sysTenant/edit"), { data });
}

// 删除租户
export const deleteTenant = (id: number) => {
  return http.request<BaseResult>("delete", baseUrlApi(`sysTenant/${id}`))
}