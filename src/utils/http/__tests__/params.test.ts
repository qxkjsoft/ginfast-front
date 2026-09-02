import { describe, it, expect } from "vitest";
import { serializeParams } from "../params";

describe("serializeParams", () => {
    it("数组参数序列化为 repeat 形式（Gin 可绑定的 deptIds=1&deptIds=2）", () => {
        expect(serializeParams({ deptIds: [1, 2], pageNum: 1 })).toBe("deptIds=1&deptIds=2&pageNum=1");
    });

    it("字符串数组同样 repeat", () => {
        expect(serializeParams({ names: ["a", "b"] })).toBe("names=a&names=b");
    });

    it("空数组不产生任何键（清空筛选时不发送脏参数）", () => {
        expect(serializeParams({ deptIds: [], pageNum: 2 })).toBe("pageNum=2");
    });

    it("普通标量保持键值", () => {
        expect(serializeParams({ keyword: "abc", status: 1 })).toBe("keyword=abc&status=1");
    });

    it("空对象返回空串", () => {
        expect(serializeParams({})).toBe("");
    });

    it("不产生 qs 默认的索引下标格式（ deptIds[0]= ）", () => {
        const result = serializeParams({ deptIds: [1, 2] });
        expect(result).not.toContain("deptIds[0]");
        expect(result).not.toContain("deptIds[1]");
    });
});
