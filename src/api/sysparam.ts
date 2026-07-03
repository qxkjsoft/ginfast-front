import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

export interface SystemParam {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  code: string;
  value: string;
  status: number;
  description: string;
  createdBy: number | null;
}

export type SystemParamListResult = BaseResult<{
  list: Array<SystemParam>;
  total: number;
}>;

export type SystemParamResult = BaseResult<SystemParam>;

export interface ParamListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  code?: string;
  status?: number;
}

export interface ParamAddParams {
  name: string;
  code: string;
  value: string;
  status: number;
  description?: string;
}

export interface ParamUpdateParams {
  id: number;
  name: string;
  code: string;
  value: string;
  status: number;
  description?: string;
}

export interface ParamDeleteParams {
  id: number;
}

export const getParamListAPI = (params: ParamListParams) => {
  return http.request<SystemParamListResult>("get", baseUrlApi("sysParam/list"), { params });
};

export const getParamByIdAPI = (id: number) => {
  return http.request<SystemParamResult>("get", baseUrlApi(`sysParam/${id}`));
};

export const getParamByCodeAPI = (code: string) => {
  return http.request<SystemParamResult>("get", baseUrlApi(`sysParam/getByCode/${code}`));
};

export const addParamAPI = (data: ParamAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("sysParam/add"), { data });
};

export const updateParamAPI = (data: ParamUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("sysParam/edit"), { data });
};

export const deleteParamAPI = (data: ParamDeleteParams) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysParam/delete"), { data });
};
