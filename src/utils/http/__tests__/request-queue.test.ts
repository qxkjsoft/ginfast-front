import { describe, it, expect } from "vitest";
import { createRequestQueue, createSilentError } from "../request-queue";
import type { HttpRequestConfig } from "../types.d";

function makeConfig(): HttpRequestConfig {
    return { url: "/users/list", method: "get", headers: {} };
}

describe("createRequestQueue", () => {
    it("park 后 resolveAll：请求配置被放行并回填 Authorization", async () => {
        const queue = createRequestQueue();
        const config = makeConfig();
        const promise = queue.park(config);
        expect(queue.size()).toBe(1);

        queue.resolveAll("new-token");

        await expect(promise).resolves.toBe(config);
        expect(config.headers?.["Authorization"]).toBe("Bearer new-token");
        expect(queue.size()).toBe(0);
    });

    it("多个排队请求被 resolveAll 一次性放行", async () => {
        const queue = createRequestQueue();
        const configs = [makeConfig(), makeConfig(), makeConfig()];
        const promises = configs.map(config => queue.park(config));
        expect(queue.size()).toBe(3);

        queue.resolveAll("t");

        await Promise.all(promises.map(p => expect(p).resolves.toBeDefined()));
        configs.forEach(config => {
            expect(config.headers?.["Authorization"]).toBe("Bearer t");
        });
    });

    it("park 后 rejectAll：所有排队请求被拒绝且队列清空", async () => {
        const queue = createRequestQueue();
        const p1 = queue.park(makeConfig());
        const p2 = queue.park(makeConfig());
        const error = createSilentError("登录状态已过期，请重新登录");

        queue.rejectAll(error);

        await expect(p1).rejects.toBe(error);
        await expect(p2).rejects.toBe(error);
        expect(queue.size()).toBe(0);
    });

    it("markFailed 后 park 直接拒绝（防止刷新失败后入队的请求永久挂起）", async () => {
        const queue = createRequestQueue();
        queue.markFailed();
        expect(queue.isFailed()).toBe(true);

        const promise = queue.park(makeConfig());
        await expect(promise).rejects.toMatchObject({ silent: true, message: "登录状态已过期，请重新登录" });
        expect(queue.size()).toBe(0);
    });

    it("rejectAll 之后再 resolveAll 不会重复 settle", async () => {
        const queue = createRequestQueue();
        const promise = queue.park(makeConfig());
        const error = createSilentError("登录状态已过期，请重新登录");

        queue.rejectAll(error);
        queue.resolveAll("another-token");

        await expect(promise).rejects.toBe(error);
    });

    it("resolveAll 复位失败标记，后续刷新可重新排队", async () => {
        const queue = createRequestQueue();
        queue.markFailed();
        queue.resolveAll("t");
        expect(queue.isFailed()).toBe(false);

        const config = makeConfig();
        const promise = queue.park(config);
        queue.resolveAll("t2");
        await expect(promise).resolves.toBe(config);
    });

    it("reset 复位失败标记（新一轮刷新前调用）", () => {
        const queue = createRequestQueue();
        queue.markFailed();
        queue.reset();
        expect(queue.isFailed()).toBe(false);
    });

    it("createSilentError 产生带 silent 标记的错误", () => {
        const error = createSilentError("x");
        expect(error).toBeInstanceOf(Error);
        expect(error.silent).toBe(true);
    });
});
