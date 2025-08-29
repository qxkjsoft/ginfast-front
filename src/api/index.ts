import axios from "axios";
import router from "@/router";
import { Message } from "@arco-design/web-vue";
import { getToken, formatToken, removeToken } from "@/utils/auth";

// 是否开启本地mock
const MOCK_FLAG = import.meta.env.VITE_APP_OPEN_MOCK === "true";
// 创建axios实例
const service = axios.create({
  baseURL: MOCK_FLAG ? "" : "/api"
});
// 请求拦截器
service.interceptors.request.use(
  function (config: any) {
    // 发送请求之前做什么
    // 获取token鉴权
    const tokenData = getToken();
    if (tokenData?.accessToken) {
      // 有token，在请求头中携带token
      config.headers.Authorization = formatToken(tokenData.accessToken);
    }
    return config;
  },
  function (error: any) {
    // 请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  function (response: any) {
    if (response.status != 200) {
      Message.error("服务器异常，请联系管理员");
      return Promise.reject(response.data);
    }
    let res = response.data;
    if (res.code == 401) {
      Message.error("登录状态已过期");
      router.push("/login");
      return Promise.reject(res);
    } else if (res.code == 404) {
      Message.error("请求连接超时");
      return Promise.reject(res);
    } else if (res.code != 200) {
      Message.error(res.message);
      return Promise.reject(res);
    } else {
      // 返回数据
      return Promise.resolve(res);
    }
  },
  function (error: any) {
    removeToken();
    router.push("/login");
    return Promise.reject(error);
  }
);
export default service;
