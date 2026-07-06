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
    order?: string;
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

// ===== 路由同步 =====

/** 同步预览单项 */
export interface SyncItem {
    path: string;
    method: string;
    title: string;
    apiGroup: string;
    handler: string;
    /** 同步动作：insert 新增 / update 更新 / skip 跳过 */
    action: "insert" | "update" | "skip";
}

/** 路由同步预览结果 */
export interface SyncPreviewResult {
    /** 代码中符合条件的路由总数（=Inserted+Updated+Skipped） */
    total: number;
    /** 新增条数 */
    inserted: number;
    /** 更新条数（overwrite=true 时才可能 >0） */
    updated: number;
    /** 已存在且未覆盖的条数 */
    skipped: number;
    /** 被过滤规则排除的数量 */
    filtered: number;
    /** 将要新增/更新/跳过的明细 */
    details: SyncItem[];
    /** DB 有但代码无（仅返回提示，不操作） */
    orphanList: SyncItem[];
}

/** 路由同步参数 */
export interface SysApiSyncParams {
    /** 是否覆盖已存在记录的 Title/ApiGroup，默认 false（幂等模式） */
    overwrite?: boolean;
    /** 是否纳入 /api/plugins/* 路由，默认 true */
    includePlugins?: boolean;
    /** 插件路由分组是否带 plugins/ 前缀，默认 true */
    groupByPlugin?: boolean;
    /** 仅同步用户勾选的路由，格式为 "path|method"；为空时同步全部预览结果 */
    selectedKeys?: string[];
}

/** 预览路由同步（dry-run，不写库） */
export const previewSysApiRoutesAPI = (params?: SysApiSyncParams) => {
    return http.request<BaseResult<SyncPreviewResult>>("get", baseUrlApi("sysApi/previewRoutes"), { params });
};

/** 执行路由同步（写库） */
export const syncSysApiRoutesAPI = (data: SysApiSyncParams) => {
    return http.request<BaseResult<SyncPreviewResult>>("post", baseUrlApi("sysApi/syncRoutes"), { data });
};
