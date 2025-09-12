import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 部门接口定义
export interface DivisionItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  DeletedAt: string | null;
  parentId: number;
  name: string;
  status: number;
  leader: string;
  phone: string;
  email: string;
  sort: number;
  describe: string;
  createdBy: number;
  children: DivisionItem[] | null;
}
// 部门列表结果类型
export type DivisionsResult = BaseResult<{
  list: DivisionItem[];
}>;

// 单个部门结果类型
export type DivisionResult = BaseResult<DivisionItem>;

// 部门添加/编辑参数接口
export interface DivisionFormData {
  id?: number;
  parentId: number;
  name: string;
  status: number;
  leader?: string;
  phone?: string;
  email?: string;
  sort?: number;
  describe?: string;
}

// 部门删除参数接口
export interface DivisionDeleteData {
  id: number;
}

// 获取部门数据
export const getDivisionAPI = () => {
  return http.request<DivisionsResult>("get", baseUrlApi("sysDepartment/getDivision"));
};

// 根据ID获取部门信息
export const getDivisionByIdAPI = (id: number) => {
  return http.request<DivisionResult>("get", baseUrlApi(`sysDepartment/${id}`));
};

// 新增部门
export const addDivisionAPI = (data: DivisionFormData) => {
  return http.request<BaseResult>("post", baseUrlApi("sysDepartment/add"), { data });
};

// 更新部门
export const updateDivisionAPI = (data: DivisionFormData) => {
  return http.request<BaseResult>("put", baseUrlApi("sysDepartment/edit"), { data });
};

// 删除部门
export const deleteDivisionAPI = (data: DivisionDeleteData) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysDepartment/delete"), { data });
};
