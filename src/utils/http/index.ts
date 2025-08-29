import Axios, { type AxiosInstance, type AxiosRequestConfig, type CustomParamsSerializer } from "axios";
import type { HttpError, RequestMethods, HttpResponse, HttpRequestConfig } from "./types.d";
import { stringify } from "qs";
//import NProgress from "../progress";
import { getToken, formatToken } from "../auth";
import { useUserStoreHook } from "@/store/modules/user";
import router from "@/router";
import { Message } from "@arco-design/web-vue";
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class Http {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests: Array<(token: string) => void> = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: HttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: HttpRequestConfig) {
    return new Promise(resolve => {
      Http.requests.push((token: string) => {
        if (config.headers) {
          config.headers["Authorization"] = formatToken(token);
        }
        resolve(config);
      });
    });
  }

  // 跳转登录页
  private static redirectToLoginPage() {
    // 刷新token失败，清除用户信息并跳转到登录页
    useUserStoreHook().logOut();
    // 清空待执行的请求队列
    Http.requests = [];
    // 显示友好提示
    // import("@arco-design/web-vue").then(({ Message }) => {
    //     Message.error("登录状态已过期，请重新登录");
    // });
    Message.error("登录状态已过期，请重新登录");
    setTimeout(() => {
      router.push({
        path: "/login",
        query: {
          redirect: router.currentRoute.value.fullPath
        }
      });
    }, 1000);
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    Http.axiosInstance.interceptors.request.use(
      async (config: HttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        //NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (Http.initConfig.beforeRequestCallback) {
          Http.initConfig.beforeRequestCallback(config);
          return config;
        }

        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = ["/refreshToken", "/login", "/captcha/id", "/captcha/image"];
        return whiteList.some(url => config.url?.endsWith(url))
          ? config
          : new Promise(resolve => {
              const data = getToken();
              //console.log("httpInterceptorsRequest:", config.url, data)
              if (data) {
                const expired = data.accessTokenExpires * 1000 - Date.now() <= 0;
                if (expired) {
                  // 过期处理
                  if (!Http.isRefreshing) {
                    Http.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken(data.refreshToken)
                      .then((res: any) => {
                        const token = res.data.accessToken;
                        if (config.headers) {
                          config.headers["Authorization"] = formatToken(token);
                        }
                        Http.requests.forEach(cb => cb(token));
                        Http.requests = [];
                      })
                      .finally(() => {
                        Http.isRefreshing = false;
                      });
                  }
                  resolve(Http.retryOriginalRequest(config));
                } else {
                  // 未过期
                  if (config.headers) {
                    config.headers["Authorization"] = formatToken(data.accessToken);
                  }
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = Http.axiosInstance;
    instance.interceptors.response.use(
      (response: HttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        //NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (Http.initConfig.beforeResponseCallback) {
          Http.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: HttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        //NProgress.done();
        // 增强错误处理
        if (!$error.isCancelRequest) {
          const status = $error.response?.status;
          const config = $error.config;
          if (config?.url?.includes("/refreshToken") && status === 400) {
            Http.redirectToLoginPage();
          }

          // 401/403 认证相关错误处理
          if (status === 401) {
            Http.redirectToLoginPage();
          }
        }
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: HttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as HttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      Http.axiosInstance
        .request(config)
        .then((response: any) => {
          resolve(response);
        })
        .catch(error => {
          const { response } = error;
          if (response?.data?.code == 1) {
            Message.error(response?.data?.message || "服务器异常，请联系管理员");
          }
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new Http();
