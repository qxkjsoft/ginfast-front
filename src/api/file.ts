import { http } from "@/utils/http";
import { baseUrlApi } from "@/api/utils";
import { BaseResult } from "@/api/types";

// 文件附件类型定义
export interface AffixItem {
    id: number;
    name: string;
    path: string;
    size: number;
    ftype: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
}

// 文件列表响应
export type AffixListResult = BaseResult<{
    list: Array<AffixItem>;
    total: number;
}>;

// 上传文件响应
export type UploadResult = BaseResult<{
    id: number;
    name: string;
    path: string;
    size: number;
    ftype: string;
    url: string;
}>;

// 文件详情响应
export type AffixDetailResult = BaseResult<AffixItem>;

// 文件列表请求参数
export interface AffixListParams {
    pageNum: number;
    pageSize: number;
    name?: string;
    ftype?: string;
}

// 删除文件请求参数
export interface DeleteAffixParams {
    id: number;
}

// 修改文件名请求参数
export interface UpdateAffixNameParams {
    id: number;
    name: string;
}

// 上传文件
export const uploadAffixAPI = (data: FormData) => {
    return http.request<UploadResult>("post", baseUrlApi("sysAffix/upload"), {
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

// 删除文件
export const deleteAffixAPI = (data: DeleteAffixParams) => {
    return http.request<BaseResult>("delete", baseUrlApi("sysAffix/delete"), { data });
};

// 修改文件名
export const updateAffixNameAPI = (data: UpdateAffixNameParams) => {
    return http.request<BaseResult>("put", baseUrlApi("sysAffix/updateName"), { data });
};

// 文件列表
export const getAffixListAPI = (params: AffixListParams) => {
    return http.request<AffixListResult>("get", baseUrlApi("sysAffix/list"), { params });
};

// 根据ID获取文件详情
export const getAffixDetailAPI = (id: number) => {
    return http.request<AffixDetailResult>("get", baseUrlApi(`sysAffix/${id}`));
};

// 获取文件URL
export const downloadAffixAPI = (id: number) => {
    return http.request<BaseResult<{ url: string }>>("get", baseUrlApi(`sysAffix/download/${id}`));
};