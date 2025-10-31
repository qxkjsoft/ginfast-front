import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";
import { type RoleItem } from "./role";
import { type DivisionItem } from "./department";
export type UserResult = BaseResult<{
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    accessTokenExpires: number;
    refreshTokenExpires: number;
}>;

export type RefreshTokenResult = BaseResult<{
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    refreshTokenExpires: number;
}>;


export type ProfileItem = {
    id: number;
    /** 头像 */
    avatar: string;
    /** 用户名 */
    userName: string;
    /** 昵称 */
    nickName: string;
    /** 当前登录用户的角色 */
    roleIDs: Array<number>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    tenantID: number;
    tenantCode: string;
    /** 性别 */
    sex: string;
    status: number;
    email: string;
    phone: string;
    createdAt: string;
    description: string;
    roles: Array<RoleItem>;
    department: DivisionItem;
}

export type ProfileResult = BaseResult<ProfileItem>;

export type CaptchaIdResult = BaseResult<{
    captchaId: string;
    imgUrl: string;
}>;

// 用户
export interface AccountItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    DeletedAt: string | null;
    userName: string;
    password: string;
    email: string;
    status: number;
    deptId: number;
    phone: string;
    sex: string;
    nickName: string;
    avatar: string;
    createdBy: number;
    description: string;
}

// 用户详情
export interface AccountDetail extends AccountItem {
    permissions: Array<string>;
    roles: Array<RoleItem>;
    department: DivisionItem;
}

export type AccountDetailResult = BaseResult<AccountDetail>;

// 用户列表
export type AccountsResult = BaseResult<{
    list: Array<AccountItem>;
    total: number;
}>;

/** 登录 */
export const getLogin = (data?: object) => {
    return http.request<UserResult>("post", baseUrlApi("login"), { data });
};

/** 登出 */
export const logout = () => {
    return http.request<BaseResult>("post", baseUrlApi("users/logout"));
};

/** 刷新token */
export const refreshTokenApi = (refreshToken: string) => {
    return http.request<RefreshTokenResult>("post", baseUrlApi("refreshToken"), { data: { refreshToken } });
};

/** 获取登录用户信息 */
export const getProfileAPI = () => {
    return http.request<ProfileResult>("get", baseUrlApi("users/profile"));
};

/** 获取验证码id */
export const getCaptchaId = () => {
    return http.request<CaptchaIdResult>("get", baseUrlApi("captcha/id"));
};

// 获取用户列表
export const getAccountListAPI = (param: any) => {
    return http.request<AccountsResult>("get", baseUrlApi("users/list"), { params: param });
};

// 新增用户
export const addAccountAPI = (param: any) => {
    return http.request<BaseResult>("post", baseUrlApi("users/add"), { data: param });
};

// 编辑用户
export const editAccountAPI = (param: any) => {
    return http.request<BaseResult>("put", baseUrlApi("users/edit"), { data: param });
};

// 删除用户
export const deleteAccountAPI = (param: any) => {
    return http.request<BaseResult>("delete", baseUrlApi("users/delete"), { data: param });
};

// 根据ID获取用户详情
export const getAccountDetailAPI = (id: number) => {
    return http.request<AccountDetailResult>("get", baseUrlApi(`users/${id}`));
};

// 修改单前登录用户的密码、手机、邮箱
export const updateAccountAPI = (param: any) => {
    return http.request<BaseResult>("put", baseUrlApi(`users/updateAccount`), { data: param });
};

// 修改当前登录用户的基本信息
export const updateBasicInfoAPI = (param: any) => {
    return http.request<BaseResult>("put", baseUrlApi(`users/updateBasicInfo`), { data: param });
};

// 上传用户头像
export const uploadAvatarAPI = (data: FormData) => {
    return http.request<BaseResult<{
        url: string;
    }>>("post", baseUrlApi("users/uploadAvatar"), {
        data,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};
