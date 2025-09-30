import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";

// vue-router
import router from "@/router/index";
// pinia
import pinia from "@/store/index";
// 注册全局svg
import "virtual:svg-icons-register";
// 引入自定义指令
import directives from "@/directives/index";

// 同步加载核心依赖
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import "@arco-design/web-vue/dist/arco.css";
import i18n from "@/lang/index";


const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(directives);

app.use(ArcoVue, {
    componentPrefix: "arco"
});
app.use(ArcoVueIcon);
app.use(i18n);

// 立即挂载应用，不等待非关键依赖加载
app.mount("#app");

// 使用requestIdleCallback在浏览器空闲时加载非关键依赖
const loadNonCriticalDependencies = () => {
    const loadAsync = async () => {
        try {
            // 异步加载字体
            await import("@/assets/fonts/fonts.scss");
            const { initVChartArcoTheme } = await import("@visactor/vchart-arco-theme");
            initVChartArcoTheme();
        } catch (error) {
            console.warn("Non-critical dependencies loading failed:", error);
        }
    };

    // 使用requestIdleCallback优化加载时机，降级使用setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        // 浏览器空闲时加载非关键依赖
        window.requestIdleCallback(loadAsync);
    } else {
        setTimeout(loadAsync, 100);
    }
};

// 在应用挂载后加载非关键依赖
loadNonCriticalDependencies();
