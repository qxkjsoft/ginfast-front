import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 字典项接口
export interface DictItem {
  id: number;
  name: string;
  value: string;
  status: number;
  dictId: number;
}

// 系统字典接口
export interface SystemDict {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  code: string;
  status: number;
  description: string;
  createdBy: number | null;
  list?: DictItem[];
}

// 字典列表响应
export type SystemDictListResult = BaseResult<{
  list: Array<SystemDict>;
  total: number;
}>;

// 字典详情响应
export type SystemDictResult = BaseResult<SystemDict>;

// 所有字典响应（包含字典项）
export type AllDictsResult = BaseResult<{
  list: Array<SystemDict>;
}>;

// 字典查询参数
export interface DictListParams {
  page?: number;
  limit?: number;
  order?: string;
  name?: string;
  code?: string;
  status?: number;
}

// 字典添加参数
export interface DictAddParams {
  name: string;
  code: string;
  status: number;
  description?: string;
}

// 字典更新参数
export interface DictUpdateParams {
  id: number;
  name: string;
  code: string;
  status: number;
  description?: string;
}

// 字典删除参数
export interface DictDeleteParams {
  id: number;
}

// 获取所有字典数据（包含关联字典项）
export const getAllDictsAPI = () => {
  return http.request<AllDictsResult>("get", baseUrlApi("sysDict/getAllDicts"));
};

// 根据字典编码获取字典及其字典项
export const getDictByCodeAPI = (code: string) => {
  return http.request<SystemDictResult>("get", baseUrlApi(`sysDict/getByCode/${code}`));
};

// 字典分页列表
export const getDictListAPI = (params: DictListParams) => {
  return http.request<SystemDictListResult>("get", baseUrlApi("sysDict/list"), { params });
};

// 根据ID获取字典信息
export const getDictByIdAPI = (id: number) => {
  return http.request<SystemDictResult>("get", baseUrlApi(`sysDict/${id}`));
};

// 新增字典
export const addDictAPI = (data: DictAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("sysDict/add"), { data });
};

// 更新字典
export const updateDictAPI = (data: DictUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("sysDict/edit"), { data });
};

// 删除字典
export const deleteDictAPI = (data: DictDeleteParams) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysDict/delete"), { data });
};

/**
 *  字典项
 */

// 系统字典项接口
export interface SystemDictItem {
  id: number;
  name: string;
  value: string;
  status: number;
  dictId: number;
  dict?: SystemDict;
}

// 字典项列表响应
export type SystemDictItemListResult = BaseResult<{
  list: Array<SystemDictItem>;
}>;

// 字典项详情响应
export type SystemDictItemResult = BaseResult<SystemDictItem>;

// 字典项查询参数
export interface DictItemListParams {
  name?: string;
  value?: string;
  status?: number;
  dictId?: number;
}

// 字典项添加参数
export interface DictItemAddParams {
  name: string;
  value: string;
  status: number;
  dictId: number;
}

// 字典项更新参数
export interface DictItemUpdateParams {
  id: number;
  name: string;
  value: string;
  status: number;
  dictId: number;
}

// 字典项删除参数
export interface DictItemDeleteParams {
  id: number;
}

// 字典项列表（无分页）
export const getDictItemListAPI = (params?: DictItemListParams) => {
  return http.request<SystemDictItemListResult>("get", baseUrlApi("sysDictItem/list"), { params });
};

// 根据ID获取字典项信息
export const getDictItemByIdAPI = (id: number) => {
  return http.request<SystemDictItemResult>("get", baseUrlApi(`sysDictItem/${id}`));
};

// 根据字典ID获取字典项列表
export const getDictItemsByDictIdAPI = (dictId: number) => {
  return http.request<SystemDictItemListResult>("get", baseUrlApi(`sysDictItem/getByDictId/${dictId}`));
};

// 根据字典编码获取字典项列表
export const getDictItemsByDictCodeAPI = (dictCode: string) => {
  return http.request<SystemDictItemListResult>("get", baseUrlApi(`sysDictItem/getByDictCode/${dictCode}`));
};

// 新增字典项
export const addDictItemAPI = (data: DictItemAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("sysDictItem/add"), { data });
};

// 更新字典项
export const updateDictItemAPI = (data: DictItemUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("sysDictItem/edit"), { data });
};

// 删除字典项
export const deleteDictItemAPI = (data: DictItemDeleteParams) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysDictItem/delete"), { data });
};
