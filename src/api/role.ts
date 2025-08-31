import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 角色
export interface RoleItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  DeletedAt: string | null;
  name: string;
  sort: number;
  status: number;
  description: string;
  parent_id: number;
  created_by: number;
  users: any[] | null;
  children: RoleItem[] | null;
}

export type RolesResult = BaseResult<{
  list: Array<RoleItem>;
}>;

// 获取所有的角色数据（树形）
export const getRolesAPI = () => {
  return http.request<RolesResult>("get", baseUrlApi("sysRole/getRoles"));
};
