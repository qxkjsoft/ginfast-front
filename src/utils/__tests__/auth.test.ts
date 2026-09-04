import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";

vi.mock("js-cookie", () => ({
    default: { set: vi.fn(), get: vi.fn(() => undefined), remove: vi.fn() }
}));

import { setAccessToken, setRefreshToken, AccessTokenKey, RefreshTokenKey } from "../auth";

const setMock = vi.mocked(Cookies.set);
const futureExpires = Math.floor(Date.now() / 1000) + 3600;

describe("token cookie 安全属性", () => {
    beforeEach(() => {
        setMock.mockClear();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("写入 accessToken 时附带 sameSite:Lax", () => {
        setAccessToken("at", futureExpires);
        expect(setMock).toHaveBeenCalledWith(AccessTokenKey, expect.any(String), expect.objectContaining({ sameSite: "Lax" }));
    });

    it("非 https 页面不开启 secure（兼容 http 部署，避免 cookie 被浏览器拒收）", () => {
        setAccessToken("at", futureExpires);
        expect(setMock).toHaveBeenCalledWith(AccessTokenKey, expect.any(String), expect.objectContaining({ secure: false }));
    });

    it("https 页面开启 secure", () => {
        vi.stubGlobal("window", { location: { protocol: "https:" } });
        setRefreshToken("rt", futureExpires);
        expect(setMock).toHaveBeenCalledWith(RefreshTokenKey, expect.any(String), expect.objectContaining({ secure: true, sameSite: "Lax" }));
    });

    it("空 token 不写入 cookie", () => {
        setAccessToken("", futureExpires);
        setRefreshToken("", futureExpires);
        expect(setMock).not.toHaveBeenCalled();
    });
});
