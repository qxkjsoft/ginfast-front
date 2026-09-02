import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// 独立于 vite.config.ts：单测只跑纯函数，node 环境 + @ 别名即可，不加载构建插件
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(rootDir, "src")
        }
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"]
    }
});
