import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 代码生成配置项
export interface SysGenItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    DeletedAt: string | null;
    name: string;
    moduleName: string;
    describe: string;
    createdBy: number;
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