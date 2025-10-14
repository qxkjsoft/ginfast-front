import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

import type { MenuItem } from "./menu";

// API接口项定义
export interface SysApiItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    title: string;
    path: string;
    method: string;
    apiGroup: string;
    createdBy: number;
    sysMenuList: MenuItem[];
}

// API列表结果类型
export type SysApiListResult = BaseResult<{
    list: SysApiItem[];
    total: number;
}>;

// 单个API结果类型
export type SysApiResult = BaseResult<SysApiItem>;

// API列表查询参数
export interface SysApiListParams {
    pageNum?: number;
    pageSize?: number;
    title?: string;
    path?: string;
    method?: string;
    apiGroup?: string;
    menuId?: number;
}

// 新增API参数
export interface SysApiAddParams {
    title: string;
    path: string;
    method: string;
    apiGroup: string;
}

// 更新API参数
export interface SysApiUpdateParams {
    id: number;
    title: string;
    path: string;
    method: string;
    apiGroup: string;
}

// 删除API参数
export interface SysApiDeleteParams {
    id: number;
}

// 菜单API权限关联接口
export interface MenuApiRelation {
    menuId: number;
    apiIds: number[];
}

/** 获取API列表 */
export const getSysApiListAPI = (params?: SysApiListParams) => {
    return http.request<SysApiListResult>("get", baseUrlApi("sysApi/list"), { params });
};

/** 根据ID获取API信息 */
export const getSysApiByIdAPI = (id: number) => {
    return http.request<SysApiResult>("get", baseUrlApi(`sysApi/${id}`));
};

/** 新增API */
export const addSysApiAPI = (data: SysApiAddParams) => {
    return http.request<BaseResult>("post", baseUrlApi("sysApi/add"), { data });
};

/** 更新API */
export const updateSysApiAPI = (data: SysApiUpdateParams) => {
    return http.request<BaseResult>("put", baseUrlApi("sysApi/edit"), { data });
};

/** 删除API */
export const deleteSysApiAPI = (data: SysApiDeleteParams) => {
    return http.request<BaseResult>("delete", baseUrlApi("sysApi/delete"), { data });
};

/** 获取菜单关联的API接口 */
export const getMenuApisAPI = (menuId: number) => {
    return http.request<BaseResult<number[]>>("get", baseUrlApi(`sysMenu/apis/${menuId}`));
};

/** 设置菜单API权限 */
export const setMenuApisAPI = (data: MenuApiRelation) => {
    return http.request<BaseResult>("post", baseUrlApi("sysMenu/setApis"), { data });
};
