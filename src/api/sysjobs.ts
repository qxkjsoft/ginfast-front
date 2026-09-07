import { http } from '@/utils/http';
import { baseUrlApi } from "@/api/utils";

import { BaseResult } from "@/api/types";


export interface SysJobsData {
    id: string; // 任务ID
    group: string; // 任务分组名称
    name: string; // 任务名称
    description: string; // 任务描述
    executorName: string; // 执行器名称
    executionPolicy: number; // 执行策略
    status: number; // 任务状态
    cronExpression: string; // Cron表达式
    parameters: string; // 任务参数
    blockingPolicy: number; // 阻塞策略
    timeout: number; // 超时时间(纳秒)
    maxRetry: number; // 最大重试次数
    retryInterval: number; // 重试间隔(纳秒)
    parallelNum: number; // 并行数
    runningCount: number; // 当前运行中的任务数
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
}

export type SysJobsListResult = BaseResult<{
    list: SysJobsData[];
    total: number;
}>;

export interface SysJobsListParams {
    pageNum: number;
    pageSize: number;
    id?: string; // 任务ID
    group?: string; // 任务分组名称
    name?: string; // 任务名称
    description?: string; // 任务描述
    executorName?: string; // 执行器名称
    executionPolicy?: number; // 执行策略
    status?: number; // 任务状态
    cronExpression?: string; // Cron表达式
    parameters?: string; // 任务参数
    blockingPolicy?: number; // 阻塞策略
    timeout?: number; // 超时时间(纳秒)
    maxRetry?: number; // 最大重试次数
    retryInterval?: number; // 重试间隔(纳秒)
    parallelNum?: number; // 并行数
    runningCount?: number; // 当前运行中的任务数
    createdAt?: string; // 创建时间
    updatedAt?: string; // 更新时间
}


export type SysJobsResult = BaseResult<SysJobsData>;

export const getSysJobsList = (params: SysJobsListParams) => {
    return http.request<SysJobsListResult>("get", baseUrlApi("sysJobs/list"), { params });
};

export const createSysJobs = (data: Omit<SysJobsData, 'id'>) => {
    return http.request<SysJobsResult>("post", baseUrlApi("sysJobs/add"), { data });
};

export const updateSysJobs= (data: Partial<SysJobsData>) => {
    return http.request<SysJobsResult>("put", baseUrlApi(`sysJobs/edit`), { data });
};

export const deleteSysJobs = (id: string) => {
    return http.request<BaseResult>("delete", baseUrlApi(`sysJobs/delete`), { data: { id } });
};


export const getSysJobs = (id: string) => {
    return http.request<SysJobsResult>("get", baseUrlApi(`sysJobs/${id}`));
};

// 获取执行器列表
export type ExecutorsListResult = BaseResult<{
    list: string[];
}>;

export const getExecutorsList = () => {
    return http.request<ExecutorsListResult>("get", baseUrlApi("sysJobs/executors"));
};

// 设置任务状态
export const setSysJobsStatus = (id: string, status: number) => {
    return http.request<BaseResult>("put", baseUrlApi("sysJobs/setStatus"), { params: { id, status } });
};

// 立即执行任务
export const executeSysJobsNow = (id: string) => {
    return http.request<BaseResult>("post", baseUrlApi("sysJobs/executeNow"), { params: { id } });
};