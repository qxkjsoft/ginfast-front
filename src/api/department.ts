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

// 获取部门数据
export const getDivisionAPI = () => {
  return http.request<DivisionsResult>("get", baseUrlApi("sysDepartment/getDivision"));
};
