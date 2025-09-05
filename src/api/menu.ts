import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";
import { type SysApiItem } from "./sysapi";

// 菜单项
export interface MenuItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parentId: number;
  path: string;
  name: string;
  component: string;
  permission: string;
  redirect: string;
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
  apis: SysApiItem[] | null;
}

export type RoutersResult = BaseResult<MenuItem[]>;

// 转换后的路由结构接口
export interface ConvertedRouteItem {
  id: number;
  parentId: number;
  path: string;
  name: string;
  component: string;
  redirect: string;
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
    permission: string;
    svgIcon: string;
    icon: string;
    sort: number;
    type: number;
  };
  children: ConvertedRouteItem[] | null;
}

export type MenuListResult = BaseResult<MenuItem[]>;

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
      // id: String(item.id),
      // parentId: String(item.parentId),
      id: item.id,
      parentId: item.parentId,
      path: item.path,
      name: item.name,
      component: item.component,
      redirect: item.redirect,
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
        permission: item.permission,
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

// 获取当前用户有权限的菜单数据不含按钮
export const getRoutersAPI = () => {
  return http.request<RoutersResult>("get", baseUrlApi("sysMenu/getRouters"));
};

// 获取完整的菜单列表
export const getMenuListAPI = () => {
  return http.request<MenuListResult>("get", baseUrlApi("sysMenu/getMenuList"));
};

// 新增
export const addMenuAPI = (data: any) => {
  return http.request<BaseResult>("post", baseUrlApi("sysMenu/add"), { data });
};

// 修改
export const updateMenuAPI = (data: any) => {
  return http.request<BaseResult>("put", baseUrlApi("sysMenu/edit"), { data });
};

// 删除
export const deleteMenuAPI = (data: any) => {
  return http.request<BaseResult>("delete", baseUrlApi("sysMenu/delete"), { data });
};
