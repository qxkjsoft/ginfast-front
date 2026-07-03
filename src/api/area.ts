import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

/**
 * 地区数据项接口
 */
export interface AreaItem {
  /** 地区编码 */
  value: string;
  /** 地区名称 */
  label: string;
  /** 级别（1:省/直辖市, 2:市, 3:区/县, 4:街道） */
  level?: number | string;
  /** 父级编码 */
  parent?: string;
  /** 排序 */
  sort?: number;
  /** 子级地区 */
  children?: AreaItem[] | null;
  /** id（来自数据库） */
  id?: number;
}

/**
 * 地区数据结果类型
 */
export type AreaResult = AreaItem[];

/**
 * 地区列表结果类型
 */
export type AreaListResult = BaseResult<{
  list: AreaItem[];
}>;

/**
 * 搜索结果项（含完整路径）
 */
export interface AreaSearchItem {
  id?: number;
  value: string;
  label: string;
  level?: number | string;
  parent?: string;
  sort?: number;
  pathText: string;
}

/**
 * 新增/编辑地区表单数据
 */
export interface AreaFormData {
  id?: number;
  value?: string;
  label: string;
  parent?: string;
  sort?: number;
}

// 内存缓存：已加载的地区数据（供 select-area 组件使用完整树）
let areaDataCache: AreaItem[] | null = null;

// Promise 缓存：正在进行的请求
let areaDataPromise: Promise<AreaItem[]> | null = null;

/**
 * 获取完整地区树（供级联选择器使用）
 * 从后端 /sysArea/tree 获取完整树，并实现缓存避免重复请求
 *
 * @returns Promise<AreaItem[]> 完整地区树
 */
export async function getAreaData(): Promise<AreaItem[]> {
  if (areaDataCache) {
    return areaDataCache;
  }
  if (areaDataPromise) {
    return areaDataPromise;
  }
  areaDataPromise = fetchAreaTreeFromServer()
    .then((data) => {
      areaDataCache = data;
      areaDataPromise = null;
      return data;
    })
    .catch((error) => {
      areaDataPromise = null;
      throw error;
    });
  return areaDataPromise;
}

/**
 * 从后端获取完整地区树
 */
async function fetchAreaTreeFromServer(): Promise<AreaItem[]> {
  try {
    const res = await http.request<AreaListResult>("get", baseUrlApi("sysArea/tree"));
    return res.data.list || [];
  } catch (error) {
    console.error("获取地区数据失败:", error);
    throw error;
  }
}

/**
 * 根据地区编码路径查找地区信息
 *
 * @param areaData 地区数据数组
 * @param path 地区编码路径数组（如 ["11", "1101", "110101"]）
 * @returns AreaItem[] 匹配的地区信息数组
 */
export function findAreaByPath(areaData: AreaItem[], path: string[]): AreaItem[] {
  const result: AreaItem[] = [];
  let currentLevel = areaData;

  for (const code of path) {
    const found = currentLevel.find((item) => item.value === code);
    if (found) {
      result.push(found);
      currentLevel = found.children || [];
    } else {
      break;
    }
  }

  return result;
}

/**
 * 清除地区数据缓存
 */
export function clearAreaDataCache(): void {
  areaDataCache = null;
  areaDataPromise = null;
}

/**
 * 刷新地区数据缓存：清空缓存后立即从后端重新拉取完整树
 * 返回最新的地区树数据
 */
export async function refreshAreaData(): Promise<AreaItem[]> {
  areaDataCache = null;
  areaDataPromise = null;
  return await getAreaData();
}

// ============ 地区管理 CRUD API ============

/**
 * 获取根节点列表（懒加载入口）
 */
export const getAreaListAPI = () => {
  return http.request<AreaListResult>("get", baseUrlApi("sysArea/list"));
};

/**
 * 获取指定节点的直接子节点（懒加载）
 */
export const getAreaChildrenAPI = (value: string) => {
  return http.request<AreaListResult>("get", baseUrlApi(`sysArea/children/${value}`));
};

/**
 * 搜索地区（返回扁平列表+完整路径）
 */
export const searchAreaAPI = (keyword: string) => {
  return http.request<BaseResult<{ list: AreaSearchItem[] }>>("get", baseUrlApi("sysArea/search"), {
    params: { keyword }
  });
};

/**
 * 新增地区
 */
export const addAreaAPI = (data: AreaFormData) => {
  return http.request<BaseResult>("post", baseUrlApi("sysArea/add"), { data });
};

/**
 * 更新地区
 */
export const updateAreaAPI = (data: AreaFormData) => {
  return http.request<BaseResult>("put", baseUrlApi("sysArea/edit"), { data });
};

/**
 * 删除地区
 */
export const deleteAreaAPI = (value: string) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysArea/delete"), {
    data: { value }
  });
};

/**
 * 初始化行政区划数据（从 area.json 导入）
 */
export const initAreaDataAPI = () => {
  return http.request<BaseResult<{ count: number }>>("post", baseUrlApi("sysArea/initData"));
};
