import { describe, expect, it } from "vitest";
import { isPublicApi } from "../public-api";

describe("isPublicApi", () => {
    it("白名单内公开端点命中（相对路径）", () => {
        expect(isPublicApi("/api/refreshToken")).toBe(true);
        expect(isPublicApi("/api/login")).toBe(true);
        expect(isPublicApi("/api/captcha/verify")).toBe(true);
        expect(isPublicApi("/api/config/get")).toBe(true);
        expect(isPublicApi("/api/sysArea/tree")).toBe(true);
    });

    it("开发环境绝对地址同样命中", () => {
        expect(isPublicApi("http://127.0.0.1:8080/api/login")).toBe(true);
        expect(isPublicApi("http://127.0.0.1:8080/api/sysArea/tree")).toBe(true);
    });

    it("非公开端点与旧白名单死条目不命中", () => {
        expect(isPublicApi("/api/users/logout")).toBe(false);
        expect(isPublicApi("/api/sysUserTenant/userListAll")).toBe(false);
        expect(isPublicApi("/api/captcha/id")).toBe(false);
        expect(isPublicApi("/api/captcha/image")).toBe(false);
    });

    it("子串相似的路径不被误命中（精确匹配而非 includes）", () => {
        expect(isPublicApi("/api/loginLog")).toBe(false);
        expect(isPublicApi("/api/config/getAll")).toBe(false);
        expect(isPublicApi("/api/sysArea/treeExport")).toBe(false);
        expect(isPublicApi("/apiv2/login")).toBe(false);
    });

    it("空值与不含 /api/ 的路径不命中", () => {
        expect(isPublicApi(undefined)).toBe(false);
        expect(isPublicApi("")).toBe(false);
        expect(isPublicApi("login")).toBe(false);
        expect(isPublicApi("/api/")).toBe(false);
    });
});
