import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 菜单项
export interface MenuItem {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  parentId: number;
  path: string;
  name: string;
  component: string;
  title: string;
  isFull: boolean;
  hide: boolean;
  disable: boolean;
  keepAlive: boolean;
  affix: boolean;
  link: string;
  iframe: boolean;
  svgIcon: string;
  icon: string;
  sort: number;
  type: number;
  createdBy: number;
  children: MenuItem[] | null;
}

export type RoutersResult = BaseResult<MenuItem[]>;

// 转换后的路由结构接口
export interface ConvertedRouteItem {
  id: string;
  parentId: string;
  path: string;
  name: string;
  component: string;
  meta: {
    title: string;
    hide: boolean;
    disable: boolean;
    keepAlive: boolean;
    affix: boolean;
    link: string;
    iframe: boolean;
    isFull: boolean;
    roles: string[];
    svgIcon: string;
    icon: string;
    sort: number;
    type: number;
  };
  children: ConvertedRouteItem[] | null;
}

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

/**
 * 将MenuItem数组转换为指定的路由结构函数
 * @param menuItems MenuItem数组
 * @returns 转换后的路由结构数组
 */
export const convertMenuItemsToRoutes = (menuItems: MenuItem[]): ConvertedRouteItem[] => {
  if (!menuItems || !Array.isArray(menuItems)) {
    return [];
  }
  return menuItems.map(item => {
    const convertedItem: ConvertedRouteItem = {
      id: String(item.ID),
      parentId: String(item.parentId),
      path: item.path,
      name: item.name,
      component: item.component,
      meta: {
        title: item.title,
        hide: item.hide,
        disable: item.disable,
        keepAlive: item.keepAlive,
        affix: item.affix,
        link: item.link || "",
        iframe: item.iframe,
        isFull: item.isFull,
        roles: [], // 角色
        svgIcon: item.svgIcon,
        icon: item.icon,
        sort: item.sort,
        type: item.type
      },
      children: null
    };

    // 递归处理子级菜单
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      convertedItem.children = convertMenuItemsToRoutes(item.children);
    }
    return convertedItem;
  });
};

// 获取菜单数据
export const getRoutersAPI = () => {
  return http.request<RoutersResult>("get", baseUrlApi("sysMenu/getMenu"));
};

// 获取部门数据
export const getDivisionAPI = () => {
  return http.request<DivisionsResult>("get", baseUrlApi("sysDepartment/getDivision"));
};

// 获取字典数据
export const getDictAPI = () => {
  return http.request<DictResult>("get", baseUrlApi("sysDict/getAllDicts"));
};
