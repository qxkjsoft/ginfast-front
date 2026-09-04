/**
 * 公开接口白名单，与后端 routes.go 的公开路由组一一对应：
 * refreshToken / login / captcha/verify / config/get / sysArea/tree
 *
 * 命中白名单的请求不附带 Authorization 头、不参与 token 过期刷新排队，
 * 防止本地残留的过期 token 把公开请求拖进刷新流程（刷新失败会被整体拒绝并跳登录页）。
 */
const publicApiPaths = new Set(["refreshToken", "login", "captcha/verify", "config/get", "sysArea/tree"]);

/**
 * 按 "/api/" 之后的路径精确匹配白名单。
 * 兼容相对路径（"/api/xxx"）与开发环境绝对地址（"http://127.0.0.1:8080/api/xxx"）；
 * 用精确匹配代替 includes 子串匹配，避免 "/api/loginLog" 之类被误放行。
 */
export const isPublicApi = (url?: string): boolean => {
    if (!url) return false;
    const index = url.indexOf("/api/");
    if (index === -1) return false;
    return publicApiPaths.has(url.slice(index + "/api/".length));
};
