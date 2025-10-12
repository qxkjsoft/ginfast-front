// https://pinia.vuejs.org/zh/
// https://prazdevs.github.io/pinia-plugin-persistedstate/zh/
// store/index.js
import { createPinia } from "pinia";
//将 Pinia 中的状态持久化存储到浏览器的本地存储 
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 创建
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 导出
export default pinia;
