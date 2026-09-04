import { describe, expect, it } from "vitest";
import { useMenuMethod } from "../useMenuMethod";

const makeMenu = (type: number, meta: Partial<Menu.MetaType> = {}): Menu.MenuOptions => ({
    id: "1",
    parentId: "0",
    path: "/demo",
    name: "demo",
    meta: {
        title: "demo",
        type,
        hide: false,
        disable: false,
        keepAlive: false,
        affix: false,
        roles: [],
        ...meta
    }
});

describe("useMenuMethod 菜单显示过滤", () => {
    const { menuShow, aMenuShow } = useMenuMethod();

    it("目录：type=1 且未隐藏、未停用才显示", () => {
        expect(menuShow(makeMenu(1))).toBe(true);
        expect(menuShow(makeMenu(1, { hide: true }))).toBe(false);
        expect(menuShow(makeMenu(1, { disable: true }))).toBe(false);
        expect(menuShow(makeMenu(2))).toBe(false);
    });

    it("菜单：type=2 且未隐藏、未停用才显示", () => {
        expect(aMenuShow(makeMenu(2))).toBe(true);
        expect(aMenuShow(makeMenu(2, { hide: true }))).toBe(false);
        expect(aMenuShow(makeMenu(2, { disable: true }))).toBe(false);
        expect(aMenuShow(makeMenu(1))).toBe(false);
    });
});
