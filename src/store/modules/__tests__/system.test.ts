import { beforeEach, describe, expect, it, vi } from "vitest";

// 桩掉字典 api 层（避免引入 axios/http 链）
vi.mock("@/api/dictionary", () => ({
    getAllDictsAPI: vi.fn()
}));

import pinia from "@/store";
import { useSystemStore } from "../system";
import { getAllDictsAPI } from "@/api/dictionary";

describe("setDictData 空数据保护", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("业务失败（data 为 null）时不抛 TypeError，字典置空", async () => {
        vi.mocked(getAllDictsAPI).mockResolvedValue({ code: 1, message: "失败", data: null } as any);

        const store = useSystemStore(pinia);
        await expect(store.setDictData()).resolves.toBeUndefined();
        expect(store.dict).toEqual([]);
    });

    it("正常返回时写入字典列表", async () => {
        vi.mocked(getAllDictsAPI).mockResolvedValue({ code: 0, message: "ok", data: { list: [{ id: 1, name: "性别" }] } } as any);

        const store = useSystemStore(pinia);
        await store.setDictData();
        expect(store.dict).toEqual([{ id: 1, name: "性别" }]);
    });
});
