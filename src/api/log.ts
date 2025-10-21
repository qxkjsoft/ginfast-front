import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";
import { Message } from "@arco-design/web-vue";
// 操作日志数据模型
export interface OperationLogItem {
    id: number;
    userId: number;
    username: string;
    module: string;
    operation: string;
    method: string;
    path: string;
    ip: string;
    userAgent: string;
    requestData: string;
    responseData: string;
    statusCode: number;
    duration: number;
    errorMsg: string;
    location: string;
    deptId: number;
    deptName: string;
    createdAt: string;
    updatedAt: string;
}

// 日志列表响应
export type OperationLogsResult = BaseResult<{
    list: Array<OperationLogItem>;
    total: number;
}>;



// 获取操作日志列表
export const getOperationLogsAPI = (params: any) => {
    return http.request<OperationLogsResult>("get", baseUrlApi("sysOperationLog/list"), { params });
};

// 删除操作日志
export const deleteOperationLogsAPI = (data: { ids: number[] }) => {
    return http.request<BaseResult>("delete", baseUrlApi("sysOperationLog/delete"), { data });
};


// 导出操作日志
export const exportOperationLogsAPI = (params: any) => {
    return http.request("get", baseUrlApi("sysOperationLog/export"), {
        params,
        responseType: "blob"
    })
};