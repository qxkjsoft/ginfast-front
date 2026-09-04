import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";
import AutoImport from "unplugin-auto-import/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// 独立于 vite.config.ts：单测走 node 环境 + @ 别名，不加载构建插件；
// 仅注入与构建期一致的 auto-import（store 模块中的 ref 等依赖它），dts 关闭避免测试运行改写文件
export default defineConfig({
    plugins: [
        AutoImport({
            imports: ["vue", "vue-router"],
            dts: false
        })
    ],
    resolve: {
        alias: {
            "@": resolve(rootDir, "src")
        }
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        setupFiles: ["vitest.setup.ts"]
    }
});
