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
  parentId: number;
  createdBy: number;
  users: any[] | null;
  children: RoleItem[] | null;
}

export type RolesResult = BaseResult<{
  list: Array<RoleItem>;
}>;

export type UserPermissionResult = BaseResult<{
  list: Array<number>;
}>;

// 获取所有的角色数据（树形）
export const getRolesAPI = () => {
  return http.request<RolesResult>("get", baseUrlApi("sysRole/getRoles"));
};

//根据角色ID获取角色菜单权限
export const getUserPermissionAPI = (roleId: number) => {
  return http.request<UserPermissionResult>("get", baseUrlApi(`sysRole/getUserPermission/${roleId}`));
};

// 添加角色的菜单权限
export const addRoleMenuAPI = (roleId: number, menuId: Array<number>) => {
  return http.request<BaseResult>("post", baseUrlApi(`sysRole/addRoleMenu`), { data: { roleId, menuId } });
};

// 添加角色
export const addRoleAPI = (param: any) => {
  return http.request<BaseResult>("post", baseUrlApi(`sysRole/add`), { data: param });
};

// 编辑角色
export const editRoleAPI = (param: any) => {
  return http.request<BaseResult>("put", baseUrlApi(`sysRole/edit`), { data: param });
};

// 删除角色
export const deleteRoleAPI = (param: any) => {
  return http.request<BaseResult>("delete", baseUrlApi(`sysRole/delete`), { data: param });
};
