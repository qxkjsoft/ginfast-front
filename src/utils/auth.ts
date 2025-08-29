import Cookies from "js-cookie";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  accessTokenExpires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** `refreshToken`的过期时间（时间戳） */
  refreshTokenExpires: T;
}

export const TokenKey = "authorized-token";
export const UserInfoKey = "user-info";

export function hasToken(): boolean {
  return !!Cookies.get(TokenKey);
}

export function getToken(): DataInfo<number> | null {
  const cookieToken = Cookies.get(TokenKey);
  if (cookieToken) {
    return JSON.parse(cookieToken);
  }
  return null;
}

export function setToken(data: DataInfo<number>) {
  const { refreshTokenExpires } = data;
  const cookieString = JSON.stringify(data);
  //console.log("setToken:", data)
  // 设置cookies
  if (refreshTokenExpires > 0) {
    Cookies.set(TokenKey, cookieString, {
      expires: (refreshTokenExpires * 1000 - Date.now()) / 86400000
    });
  } else {
    Cookies.set(TokenKey, cookieString);
  }
}

export function setRefreshToken(accessToken: string, accessTokenExpires: number) {
  // 从 Cookies 获取现有数据并更新
  const cookieToken = Cookies.get(TokenKey);
  if (cookieToken) {
    try {
      const cookieData: DataInfo<number> = JSON.parse(cookieToken);
      // 更新 accessToken 和 accessTokenExpires
      cookieData.accessToken = accessToken;
      cookieData.accessTokenExpires = accessTokenExpires;

      // 重新保存到 Cookies
      const updatedCookieString = JSON.stringify(cookieData);
      const { refreshTokenExpires } = cookieData;
      if (refreshTokenExpires > 0) {
        Cookies.set(TokenKey, updatedCookieString, {
          expires: (refreshTokenExpires * 1000 - Date.now()) / 86400000
        });
      } else {
        Cookies.set(TokenKey, updatedCookieString);
      }
    } catch (error) {
      console.error("Failed to update cookie token:", error);
    }
  }
}

/** 删除`token`信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
}

export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
