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

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(directives);

// 延迟初始化VChart主题，避免阻塞首次启动
const loadNonCriticalDependencies = async () => {
  // 异步加载 ArcoVue
  const [ArcoVue, ArcoVueIcon] = await Promise.all([import("@arco-design/web-vue"), import("@arco-design/web-vue/es/icon")]);

  // 异步加载 CSS
  await import("@arco-design/web-vue/dist/arco.css");

  // 应用 ArcoVue
  app.use(ArcoVue.default, {
    componentPrefix: "arco"
  });
  app.use(ArcoVueIcon.default);

  // 异步加载 i18n
  const i18n = await import("@/lang/index");
  app.use(i18n.default);

  // 异步加载字体
  await import("@/assets/fonts/fonts.scss");

  // 异步初始化 VChart 主题
  const { initVChartArcoTheme } = await import("@visactor/vchart-arco-theme");
  initVChartArcoTheme();
};

// 立即挂载应用，不等待非关键依赖加载
app.mount("#app");

// 在后台加载非关键依赖
loadNonCriticalDependencies();
