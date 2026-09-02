// 请求排队队列：解决 axios 拦截器中 "token 过期 → 静默刷新 → 重放请求" 流程的两个历史缺陷：
// 1. 刷新失败时排队中的请求 promise 永不 settle，页面请求永久挂起（旧实现只清空数组，不拒绝 promise）；
// 2. 刷新失败后（3 秒节流窗口内）新到的请求仍会入队，同样永久挂起。
import type { HttpRequestConfig } from "./types.d"; // 仅引入请求配置类型，运行时零依赖
import { formatToken } from "../auth"; // 将 accessToken 包装为 "Bearer xxx" 请求头的工具函数

/** 带 silent 标记的错误：刷新登录态失败被拒的请求属于预期行为，不弹全局错误提示 */
// 交叉类型：在原生 Error 上追加 silent 布尔标记，供 http/index.ts 的 catch 分支识别
export type SilentError = Error & { silent: boolean };

/**
 * 创建一个 silent 错误实例
 * @param message 错误消息文本
 * @returns 带 silent=true 标记的 Error，request() 的 catch 会跳过它的全局 toast
 */
export function createSilentError(message: string): SilentError {
    const error = new Error(message) as SilentError; // 构造标准 Error，并断言为 SilentError 形状
    error.silent = true; // 打上静默标记：调用方据此决定不弹 "服务器异常" 提示
    return error; // 返回带标记的错误对象
}

/** 请求队列对外的能力契约，由 createRequestQueue() 工厂返回 */
export interface RequestQueue {
    /** 暂存待刷新后重放的请求，返回的 promise 在刷新成功/失败时 settle */
    // 把过期请求的配置挂起：刷新成功则 resolve（配置已回填新 token），失败则 reject
    park(config: HttpRequestConfig): Promise<HttpRequestConfig>;
    /** 刷新成功：回填新 token 并放行所有排队请求，同时复位失败标记 */
    // 用新 token 逐个回填排队请求的 Authorization 头并放行
    resolveAll(token: string): void;
    /** 刷新失败：拒绝所有排队请求 */
    // 用同一个 silent 错误拒绝所有排队请求，调用方（axios 层）可据此统一处理
    rejectAll(error: SilentError): void;
    /** 标记刷新已失败：后续 park 直接拒绝，防止刷新失败后的入队请求永久挂起 */
    // 打开 "已失败" 开关：此后再有请求入队，不做等待、立即拒绝
    markFailed(): void;
    /** 复位失败标记：发起新一轮刷新前调用，避免历史失败永久拦截后续正常刷新 */
    // 关闭 "已失败" 开关：新一轮刷新开始时调用，让排队机制恢复可用
    reset(): void;
    /** 当前是否处于刷新失败状态 */
    // 读取失败开关（主要供测试与诊断断言用）
    isFailed(): boolean;
    /** 队列中排队请求数（测试/诊断用） */
    // 当前仍在排队的请求数量
    size(): number;
}

/** 队列内部的一条排队记录：保存 promise 的两个 settle 函数和原请求配置 */
interface QueueEntry {
    resolve: (config: HttpRequestConfig) => void; // 刷新成功时调用：放行请求（配置已带新 token）
    reject: (error: unknown) => void; // 刷新失败时调用：拒绝请求
    config: HttpRequestConfig; // 被挂起的原始 axios 请求配置（回填 token 时直接改写它）
}

/**
 * 创建一个独立的请求排队队列实例
 * 内部状态（failed / entries）被闭包私有化，外部只能通过返回的方法操作，
 * 因此多实例之间互不影响，也便于在单元测试中单独验证排队行为。
 * @returns 实现 RequestQueue 接口的队列实例
 */
export function createRequestQueue(): RequestQueue {
    let failed = false; // 失败开关：true 表示上一次刷新已失败，新请求不再入队
    let entries: QueueEntry[] = []; // 排队记录数组：所有等待 token 刷新结果的请求

    /**
     * 排空队列：先整体取出再清空，最后逐条处理
     * 先清空后处理有两个目的：
     * 1. 处理过程中若又触发 park（极端时序），新请求进入的是全新的空队列，不会被误结算；
     * 2. 处理完毕后队列必然为空，size() 归零。
     * @param fn 对每条排队记录执行的动作（resolve 或 reject）
     */
    const drain = (fn: (entry: QueueEntry) => void) => {
        const current = entries; // 暂存当前所有排队记录
        entries = []; // 立即清空队列，防止处理期间被重复排空
        current.forEach(fn); // 对取出的每条记录执行 resolve/reject
    };

    return {
        // 把一个 token 已过期的请求挂起到队列中
        park(config: HttpRequestConfig) {
            return new Promise<HttpRequestConfig>((resolve, reject) => {
                // 失败状态下不再入队：直接以 silent 错误拒绝，
                // 这是修复点 2——避免刷新失败后（跳转登录前的节流窗口内）新到的请求永久挂起
                if (failed) {
                    reject(createSilentError("登录状态已过期，请重新登录"));
                    return; // 拒绝后结束，不进入排队
                }
                // 正常状态：记录 promise 的 settle 函数与请求配置，等待 resolveAll/rejectAll 结算
                entries.push({ resolve, reject, config });
            });
        },

        // 刷新成功：复位失败标记，回填新 token 后放行所有排队请求
        resolveAll(token: string) {
            failed = false; // 成功即复位失败标记，排队机制恢复正常
            drain(entry => {
                if (entry.config.headers) {
                    // 原地改写排队请求的 Authorization 头为 "Bearer 新token"，
                    // 重放时拦截器不会再把它判定为过期请求（旧实现同样有此逻辑）
                    entry.config.headers["Authorization"] = formatToken(token);
                }
                entry.resolve(entry.config); // resolve 掉 park 返回的 promise，axios 拿到配置后重放请求
            });
        },

        // 刷新失败：以同一个 silent 错误拒绝所有排队请求
        // 这是修复点 1——旧实现 "requests = []" 只是丢弃引用，promise 永不 settle
        rejectAll(error: SilentError) {
            drain(entry => entry.reject(error)); // 每条排队记录都被 reject，调用方的 await 立即返回
        },

        // 打开失败开关：由 redirectLoginPage / 刷新 catch 分支调用
        markFailed() {
            failed = true; // 此后 park 会直接拒绝新请求
        },

        // 关闭失败开关：发起新一轮刷新前调用，避免上一次的失败状态永久拦截本次排队
        reset() {
            failed = false; // 恢复正常入队能力
        },

        // 查询当前是否处于刷新失败状态（测试断言用）
        isFailed() {
            return failed; // 返回失败开关的当前值
        },

        // 查询当前排队中的请求数（测试断言用）
        size() {
            return entries.length; // 排队记录的数量
        }
    };
}
