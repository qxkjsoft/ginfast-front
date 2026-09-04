import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// route-config 依赖真实 router 实例与菜单接口，这里替换为无副作用的桩：
// vue-router 的 createWebHashHistory 在 node 测试环境不可用，api/menu 会拖入整个 http/axios 链
vi.mock("@/router/index", () => ({
    default: { hasRoute: () => false, removeRoute: vi.fn(), addRoute: vi.fn() }
}));
vi.mock("@/api/menu", () => ({
    getRoutersAPI: vi.fn(),
    convertMenuItemsToRoutes: vi.fn(() => [])
}));

import { useRouteConfigStore } from "../route-config";

const makeTab = (path: string, affix = false): Menu.MenuOptions => ({
    id: "1",
    parentId: "0",
    path,
    name: path,
    meta: { title: path, hide: false, disable: false, keepAlive: false, affix, roles: [] }
});

describe("removeTabsList", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("关闭不在 tabs 里的路径不抛错且列表不变（原 index===-1 判断在解引用之后属死代码）", () => {
        const store = useRouteConfigStore();
        store.tabsList = [makeTab("/home")];
        expect(() => store.removeTabsList("/not-in-tabs")).not.toThrow();
        expect(store.tabsList).toHaveLength(1);
    });

    it("affix 固定标签不可关闭", () => {
        const store = useRouteConfigStore();
        store.tabsList = [makeTab("/home", true)];
        store.removeTabsList("/home");
        expect(store.tabsList).toHaveLength(1);
    });

    it("普通标签正常删除", () => {
        const store = useRouteConfigStore();
        store.tabsList = [makeTab("/home"), makeTab("/system/user")];
        store.removeTabsList("/system/user");
        expect(store.tabsList).toHaveLength(1);
        expect(store.tabsList[0].path).toBe("/home");
    });
});
