import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
export type UserResult = {
  code: number;
  data: {
    user: {
      id: number;
      /** 头像 */
      avatar: string;
      /** 用户名 */
      username: string;
      /** 昵称 */
      nickname: string;
      /** 当前登录用户的角色 */
      roles: Array<string>;
      /** 按钮级别权限 */
      permissions: Array<string>;
    };

    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: number;
  };
  message: string;
};
/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<any>("post", baseUrlApi("login"), { data });
};
