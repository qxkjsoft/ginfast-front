import { defineStore } from "pinia";
import pinia from "@/store";
import { type DataInfo, userKey, getLocalStorage, setToken } from "@/utils/auth";
import { type userType } from "@/store/types";
import { type UserResult, getLogin } from "@/api/user";

export const useUserStore = defineStore("user", {
  state: (): userType => {
    const userInfo = getLocalStorage<DataInfo<number>>(userKey);
    return {
      // 用户ID
      id: userInfo?.user?.id ?? 0,
      // 头像
      avatar: userInfo?.user?.avatar ?? "",
      // 用户名
      username: userInfo?.user?.username ?? "",
      // 昵称
      nickname: userInfo?.user?.nickname ?? "",
      // 页面级别权限
      roles: userInfo?.user?.roles ?? [],
      // 按钮级别权限
      permissions: userInfo?.user?.permissions ?? []
    };
  },
  actions: {
    /** 存储用户ID */
    SET_ID(id: number) {
      (this as any).id = id;
    },
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      (this as any).avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      (this as any).username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      (this as any).nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      (this as any).roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      (this as any).permissions = permissions;
    },
    /** 登入 */
    async loginByUsername(data: any) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            if (res?.code === 0) {
              setToken(res?.data);
              resolve(res);
            } else {
              reject(res?.message || "登录失败");
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      //   this.username = "";
      //   this.roles = [];
      //   this.permissions = [];
      //   removeToken();
      //   useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      //   resetRouter();
      //   router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data: any) {
      //   return new Promise<RefreshTokenResult>((resolve, reject) => {
      //     refreshTokenApi(data)
      //       .then(data => {
      //         if (data) {
      //           setToken(data.data);
      //           resolve(data);
      //         }
      //       })
      //       .catch(error => {
      //         reject(error);
      //       });
      //   });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(pinia);
}
