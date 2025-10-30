import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";
import {type AccountItem} from "./user";
import { RolesResult } from "./role";
import {AccountsResult} from "./user";
/** 用户租户关联模型 */
export interface SysUserTenant {
  userID: number;
  tenantID: number;
  isDefault: boolean;
  user?: AccountItem; // 用户信息
  tenant?: any; // 租户信息
}

/** 用户租户关联列表响应 */
export type SysUserTenantListResponse = BaseResult<{
  list: SysUserTenant[];
  total: number;
}>;

/** 用户租户关联详情响应 */
export type SysUserTenantResponse = BaseResult<SysUserTenant>;

/** 用户租户关联列表查询参数 */
export interface SysUserTenantListParam {
  pageNum?: number;
  pageSize?: number;
  userID?: number;
  tenantID?: number;
  key?: string;
}

/** 设置用户角色参数 */
export interface SysUserTenantSetRolesParam {
  userID: number;
  roles: number[];
  tenantID: number;
}

/** 获取用户角色ID集合参数 */
export interface SysUserTenantGetUserRoleIDsParam {
  userID: number;
  tenantID: number;
}

/** 用户租户关联批量新增参数 */
export interface SysUserTenantBatchAddParam {
  userIDs: number[];
  tenantID: number;
}

/** 用户租户关联批量删除参数 */
export interface SysUserTenantBatchDeleteParam {
  userIDs: number[];
  tenantID: number;
}

export interface RolesAllParam {
  tenantID?: number;
  ParentID?: number;
  Status?: number;
}


/** 获取用户租户关联列表 */
export const getSysUserTenantList = (params: SysUserTenantListParam) => {
  return http.request<SysUserTenantListResponse>("get", baseUrlApi("sysUserTenant/list"), { params });
};

/** 根据用户ID和租户ID获取用户租户关联信息 */
export const getSysUserTenantById = (userID: number, tenantID: number) => {
  return http.request<SysUserTenantResponse>("get", baseUrlApi("sysUserTenant/get"), { 
    params: { userID, tenantID } 
  });
};


/** 批量新增用户租户关联 */
export const batchAddSysUserTenant = (data: SysUserTenantBatchAddParam) => {
  return http.request<BaseResult>("post", baseUrlApi("sysUserTenant/batchAdd"), { data });
};

/** 批量删除用户租户关联 */
export const batchDeleteSysUserTenant = (data: SysUserTenantBatchDeleteParam) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysUserTenant/batchDelete"), { data });
};

// 获取用户列表（不进行租户过滤）
export const getAccountListAllAPI = (param: any) => {
    return http.request<AccountsResult>("get", baseUrlApi("sysUserTenant/userListAll"), { params: param });
};

// 获取所有的角色数据（树形, 不进行租户过滤）
export const getRolesAllAPI = (param: RolesAllParam) => {
    return http.request<RolesResult>("get", baseUrlApi("sysUserTenant/getRolesAll"), { params: param });
};

/** 设置用户角色 */
export const setUserRoles = (data: SysUserTenantSetRolesParam) => {
  return http.request<BaseResult>("post", baseUrlApi("sysUserTenant/setUserRoles"), { data });
};

/** 获取用户角色ID集合 */
export const getUserRoleIDs = (params: SysUserTenantGetUserRoleIDsParam) => {
  return http.request<BaseResult<number[]>>("get", baseUrlApi("sysUserTenant/getUserRoleIDs"), { params });
};
