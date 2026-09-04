import { describe, expect, it, vi } from "vitest";

// 桩掉 user store 的全部外部依赖：api 层（axios/http 链）、localStorage 包装（node 环境无 localStorage）、
// js-cookie（node 环境无 document）、真实 router（createWebHashHistory 依赖 window）
vi.mock("js-cookie", () => ({
    default: { set: vi.fn(), get: vi.fn(() => undefined), remove: vi.fn() }
}));
vi.mock("@/utils/app", () => ({
    getLocalStorage: vi.fn(() => undefined),
    setLocalStorage: vi.fn(),
    removeLocalStorage: vi.fn(),
    handleUrl: vi.fn((v: string) => v)
}));
vi.mock("@/api/user", () => ({
    getLogin: vi.fn(),
    refreshTokenApi: vi.fn(),
    getProfileAPI: vi.fn(),
    switchTenantAPI: vi.fn()
}));
vi.mock("@/router/index", () => ({
    default: { hasRoute: () => false, removeRoute: vi.fn(), addRoute: vi.fn() }
}));
vi.mock("@/api/menu", () => ({
    getRoutersAPI: vi.fn(),
    convertMenuItemsToRoutes: vi.fn(() => [])
}));

import pinia from "@/store";
import { useUserStore } from "../user";
import { useRouteConfigStore } from "../route-config";

const makeTab = (path: string): Menu.MenuOptions => ({
    id: "1",
    parentId: "0",
    path,
    name: path,
    meta: { title: path, hide: false, disable: false, keepAlive: false, affix: false, roles: [] }
});

describe("logOut 清理路由数据", () => {
    it("登出时清空 tabs/路由树/路由列表/当前路由（会话过期与手动登出共用该 action）", async () => {
        const userStore = useUserStore(pinia);
        const routeStore = useRouteConfigStore(pinia);

        // 模拟上一会话残留的动态路由与 tabs
        routeStore.routeTree = [{ path: "/system/user" }];
        routeStore.routeList = [{ ...makeTab("/system/user"), name: "system-user" }];
        routeStore.tabsList = [makeTab("/system/user")];
        routeStore.currentRoute = makeTab("/system/user");

        await userStore.logOut();

        expect(routeStore.routeTree).toHaveLength(0);
        expect(routeStore.routeList).toHaveLength(0);
        expect(routeStore.tabsList).toHaveLength(0);
        expect(routeStore.currentRoute).toEqual({});
        // 用户态与本地凭证一并清理
        expect(userStore.account.id).toBe(0);
        expect(userStore.account.roles).toHaveLength(0);
    });
});
