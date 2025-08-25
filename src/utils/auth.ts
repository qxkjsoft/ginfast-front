import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  accessTokenExpires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** `refreshToken`的过期时间（时间戳） */
  refreshTokenExpires: T;
  user: {
    /** 用户ID */
    id?: number;
    /** 头像 */
    avatar?: string;
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** 当前登录用户的角色 */
    roles?: Array<string>;
    /** 当前登录用户的按钮级别权限 */
    permissions?: Array<string>;
  };
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";

export function getToken(): DataInfo<number> | null {
  const cookieToken = Cookies.get(TokenKey);
  if (cookieToken) {
    return JSON.parse(cookieToken);
  }
  return getLocalStorage(userKey);
}

export function setToken(data: DataInfo<number>) {
  const { refreshTokenExpires } = data;
  const cookieString = JSON.stringify(data);
  if (refreshTokenExpires > 0) {
    Cookies.set(TokenKey, cookieString, {
      expires: (refreshTokenExpires * 1000 - Date.now()) / 86400000
    });
  } else {
    Cookies.set(TokenKey, cookieString);
  }

  useUserStoreHook().SET_ID(data.user?.id);
  useUserStoreHook().SET_AVATAR(data.user?.avatar);
  useUserStoreHook().SET_USERNAME(data.user?.username);
  useUserStoreHook().SET_NICKNAME(data.user?.nickname);
  useUserStoreHook().SET_ROLES(data.user?.roles);
  useUserStoreHook().SET_PERMS(data.user?.permissions);
  setLocalStorage(userKey, data);
}
/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  removeLocalStorage(userKey);
}

export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

export function getLocalStorage<T>(key: string): T | null {
  try {
    // 从localStorage中获取字符串值
    const item = localStorage.getItem(key);

    // 如果值不存在，返回 null
    if (item === null) {
      return null;
    }

    // 尝试解析 JSON 字符串
    const parsedValue = JSON.parse(item);

    // 返回解析后的值，类型断言为 T
    return parsedValue as T;
  } catch (error) {
    // JSON 解析失败时，说明是原始字符串或数值，直接返回
    const item = localStorage.getItem(key);
    // 尝试转换为数值，如果失败则返回原始字符串
    if (item !== null && !isNaN(Number(item))) {
      return Number(item) as T;
    }
    return item as T;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  // 对于字符串和数值直接存储，对象和数组使用 JSON.stringify
  if (typeof value === "string" || typeof value === "number") {
    localStorage.setItem(key, String(value));
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem(key);
}
