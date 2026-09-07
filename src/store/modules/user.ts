import { defineStore } from "pinia";
import { ref } from "vue";
import pinia from "@/store";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { setAccessToken, setRefreshToken, removeAccessToken, removeRefreshToken, UserInfoKey } from "@/utils/auth";
//import { type userType } from "@/store/types";
import { getLocalStorage, setLocalStorage, removeLocalStorage } from "@/utils/app";
import { type UserResult, type RefreshTokenResult, getLogin, refreshTokenApi, getProfileAPI, switchTenantAPI } from "@/api/user";
import { userType } from "@/store/types";
import { handleUrl } from "@/utils/app";
export const useUserStore = defineStore("user", () => {
    const userInfo = getLocalStorage<userType>(UserInfoKey);
    // State
    const account = ref<userType>({
        id: userInfo?.id ?? 0,
        avatar: userInfo?.avatar ?? "",
        username: userInfo?.username ?? "",
        nickname: userInfo?.nickname ?? "",
        roles: userInfo?.roles ?? [],
        permissions: userInfo?.permissions ?? [],
        tenantID: userInfo?.tenantID ?? 0,         
        tenantCode: userInfo?.tenantCode ?? "",
        tenantName: userInfo?.tenantName ?? "",
        tenantDomain: userInfo?.tenantDomain ?? "", // 完整的租户域名
        defaultTenant: userInfo?.defaultTenant, // 默认所属租户
        tenants: userInfo?.tenants,    // 关联的租户列表
    });

    // action
    /** 登入 */
    const loginByUsername = async (data: any) => {
        return new Promise<UserResult>((resolve, reject) => {
            getLogin(data)
                .then(res => {
                    if (res?.code === 0) {
                        // 清除 accessToken 、 refreshToken 及登录用户信息
                        removeAccessToken();
                        removeRefreshToken();
                        removeLocalStorage(UserInfoKey);
                        // 登录成功后，设置 accessToken 和 refreshToken
                        setAccessToken(res?.data?.accessToken, res?.data?.accessTokenExpires);
                        setRefreshToken(res?.data?.refreshToken, res?.data?.refreshTokenExpires);
                        resolve(res);
                    } else {
                        reject(res?.message || "登录失败");
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    };
    /** 前端登出（不调用接口） */
    const logOut = async () => {
        account.value.id = 0;
        account.value.avatar = "";
        account.value.username = "";
        account.value.nickname = "";
        account.value.roles = [];
        account.value.permissions = [];
        account.value.tenantID = 0;
        account.value.tenantCode = "";
        account.value.tenantName = "";
        account.value.tenantDomain = "";
        account.value.defaultTenant = undefined;
        account.value.tenants = undefined;
        // 清除 accessToken 、 refreshToken 及登录用户信息
        removeAccessToken();
        removeRefreshToken();
        removeLocalStorage(UserInfoKey);
        // 清除动态路由、tabs、缓存路由：会话过期跳登录与手动登出统一走这里，
        // 防止换账号重登后上一账号的动态路由仍注册可导航
        useRouteConfigStore(pinia).resetRoute();
    };
    /** 刷新`token` */
    const handRefreshToken = async (data: string) => {
        return new Promise<RefreshTokenResult>((resolve, reject) => {
            refreshTokenApi(data)
                .then(res => {
                    //console.log("refreshTokenApi", res)
                    if (res?.code === 0) {
                        setAccessToken(res.data?.accessToken, res.data?.accessTokenExpires);
                        setRefreshToken(res.data?.refreshToken, res.data?.refreshTokenExpires);
                        resolve(res);
                    } else {
                        reject(res?.message || "刷新`refreshToken`失败");
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    };
    /** 获取并设置当前登录用户信息 */
    const getUserInfo = async () => {
        const res = await getProfileAPI();
        // 只判断 HTTP 层不够：业务失败时 HTTP 仍为 200，需检查业务 code
        if (res?.code !== 0 || !res.data?.id) {
            // 业务失败时清理旧缓存，避免沿用上一账号信息；调用方（路由守卫/切换租户）均有 catch 兜底
            removeLocalStorage(UserInfoKey);
            throw new Error(res?.message || "获取用户信息失败");
        }
        const data = res.data;
        account.value.id = data.id;
        account.value.username = data.userName;
        account.value.nickname = data.nickName;
        account.value.avatar = handleUrl(data.avatar);
        account.value.roles = data.roleIDs;
        account.value.permissions = data.permissions;
        account.value.tenantID = data.tenantID;
        account.value.tenantCode = data.tenantCode;
        account.value.tenantName = data.tenantName;
        account.value.tenantDomain = data.tenantDomain;
        account.value.defaultTenant = data.defaultTenant;
        account.value.tenants = data.tenants;
        setLocalStorage(UserInfoKey, data);
        return data;
    };
    /** 切换租户 */
    const switchTenant = async (tenantId: number) => {
        return new Promise<UserResult>((resolve, reject) => {
            switchTenantAPI(tenantId)
                .then(res => {
                    if (res?.code === 0) {
                        // 清除 accessToken 、 refreshToken 及登录用户信息
                        removeAccessToken();
                        removeRefreshToken();
                        removeLocalStorage(UserInfoKey);
                        // 切换租户成功后，设置 accessToken 和 refreshToken
                        setAccessToken(res?.data?.accessToken, res?.data?.accessTokenExpires);
                        setRefreshToken(res?.data?.refreshToken, res?.data?.refreshTokenExpires);
                        resolve(res);
                    } else {
                        reject(res?.message || "切换租户失败");
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    };
    return {
        // State
        account,
        // action
        loginByUsername,
        logOut,
        handRefreshToken,
        getUserInfo,
        switchTenant
    };
});

export function useUserStoreHook() {
    return useUserStore(pinia);
}
