import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

// 服务器配置参数
export interface SystemConfig {
    systemLogo: string;
    systemIcon: string;
    systemName: string;
    systemCopyright: string;
    systemRecordNo: string;
    defaultusername: string;
    defaultpassword: string;
}


export interface SafeConfig {
    loginLockThreshold: number;
    loginLockExpire: number;
    loginLockDuration: number;
    minPasswordLength: number;
    requireSpecialChar: boolean;
}

// 验证码配置参数
export interface CaptchaConfig {
    open: boolean;
    length: number;
}



// 配置响应数据
export interface ConfigResponseData {
    system: SystemConfig;
    captcha: CaptchaConfig;
    safe: SafeConfig;
}

// 配置请求参数
export interface ConfigRequestData {
    system: SystemConfig;
    safe: SafeConfig;
    captcha: CaptchaConfig;
}

// 获取配置响应结果
export type GetConfigResult = BaseResult<ConfigResponseData>;



/** 获取系统配置 */
export const getConfigAPI = () => {
    return http.request<GetConfigResult>("get", baseUrlApi("config/get"));
};

/** 更新系统配置 */
export const updateConfigAPI = (data: ConfigRequestData) => {
    return http.request<BaseResult>("put", baseUrlApi("config/update"), { data });
};



