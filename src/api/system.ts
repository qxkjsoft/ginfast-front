import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 字典项
export interface DictOptionItem {
  id: number;
  name: string;
  value: string;
  status: number;
  dictId: number;
}

// 字典
export interface DictItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  code: string;
  status: number;
  description: string;
  createdBy: number | null;
  list: DictOptionItem[];
}
export type DictResult = BaseResult<{
  list: Array<DictItem>;
}>;

// 获取字典数据
export const getDictAPI = () => {
  return http.request<DictResult>("get", baseUrlApi("sysDict/getAllDicts"));
};
