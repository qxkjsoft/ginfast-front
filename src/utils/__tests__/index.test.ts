import { describe, expect, it } from "vitest";
import { deepClone } from "../index";

describe("deepClone", () => {
    it("循环引用不栈溢出，引用关系保留", () => {
        const a: any = { name: "a" };
        a.self = a;
        const src = { arr: [a, a] };

        const copy = deepClone(src);

        expect(copy.arr[0].name).toBe("a");
        // 同一引用的多次出现复用同一副本
        expect(copy.arr[0]).toBe(copy.arr[1]);
        // 循环引用闭合指向副本自身
        expect(copy.arr[0].self).toBe(copy.arr[0]);
        expect(copy.arr[0]).not.toBe(a);
    });

    it("基本深拷贝语义不变", () => {
        const src = { n: 1, s: "x", arr: [1, { k: 2 }], nested: { deep: { v: true } } };
        const copy = deepClone(src);

        expect(copy).toEqual(src);
        expect(copy.arr).not.toBe(src.arr);
        expect(copy.nested.deep).not.toBe(src.nested.deep);

        copy.nested.deep.v = false;
        expect(src.nested.deep.v).toBe(true);
    });

    it("原始值原样返回，数组正确克隆", () => {
        expect(deepClone(5)).toBe(5);
        expect(deepClone(null)).toBe(null);
        expect(deepClone("abc")).toBe("abc");

        const arr = [1, [2, 3]];
        const copy = deepClone(arr);
        expect(copy).toEqual(arr);
        expect(copy).not.toBe(arr);
        expect(copy[1]).not.toBe(arr[1]);
    });
});
