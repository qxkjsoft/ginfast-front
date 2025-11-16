import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 代码生成配置项
export interface SysGenItem {
    id: number;
    name: string;
    moduleName: string;
    fileName: string;
    describe: string;
    isCover: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdBy: number;
    sysGenFields: Array<SysGenFieldItem>;
}

// 代码生成配置详情项（包含字段信息）
export interface SysGenFieldItem {
    id: number;
    genId: number;
    dataName: string;
    dataType: string;
    dataComment: string;
    dataExtra: string;
    isPrimary: number;
    goType: string;
    frontType: string;
    customName: string;
    require: number;
    listShow: number;
    formShow: number;
    queryShow: number;
    queryType: string;
    formType: string;
    dictType: string;
}

// 代码生成配置列表请求参数
export interface SysGenListParams {
    pageNum?: number;
    pageSize?: number;
    name?: string;
    moduleName?: string;
}

// 代码生成配置列表响应
export type SysGenListResult = BaseResult<{
    list: Array<SysGenItem>;
    total: number;
}>;

// 代码生成配置详情响应
export type SysGenDetailResult = BaseResult<SysGenItem>;

// 批量插入代码生成配置请求参数
export interface SysGenBatchInsertParams {
    database: string;
    tables: Array<string>;
}

// 批量插入代码生成配置响应
export interface SysGenBatchInsertResult {
    successCount: number;
    successTables: Array<string>;
    failedCount: number;
    failedTables: Record<string, string>;
}

export type SysGenBatchInsertResponse = BaseResult<SysGenBatchInsertResult>;



/**
 * 获取代码生成配置列表
 * @param params 查询参数
 * @returns 代码生成配置列表
 */
export const getSysGenListAPI = (params: SysGenListParams) => {
    return http.request<SysGenListResult>("get", baseUrlApi("sysGen/list"), { params });
};

/**
 * 批量插入代码生成配置
 * @param data 批量插入数据
 * @returns 批量插入结果
 */
export const batchInsertSysGenAPI = (data: SysGenBatchInsertParams) => {
    return http.request<SysGenBatchInsertResponse>("post", baseUrlApi("sysGen/batchInsert"), { data });
};

/**
 * 根据ID获取代码生成配置详情
 * @param id 代码生成配置ID
 * @returns 代码生成配置详情
 */
export const getSysGenByIdAPI = (id: number) => {
    return http.request<SysGenDetailResult>("get", baseUrlApi(`sysGen/${id}`));
};

/**
 * 更新代码生成配置
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateSysGenAPI = (data: SysGenItem) => {
    return http.request<BaseResult<string>>("put", baseUrlApi("sysGen/update"), { data });
};

/**
 * 删除代码生成配置
 * @param id 代码生成配置ID
 * @returns 删除结果
 */
export const deleteSysGenAPI = (id: number) => {
    return http.request<BaseResult<string>>("delete", baseUrlApi(`sysGen/${id}`));
};


/**
 * 根据ID刷新字段信息
 * @param genId 生成任务ID
 * @returns 刷新后的字段列表
 */
export const refreshFields = (genId: number) => {
  return http.request<BaseResult>("put", baseUrlApi("sysGen/refreshFields"), {
    data: { id : genId }
  });
};
