import { defineStore } from "pinia";
import persistedstateConfig from "@/store/config/index";
import { getAllDictsAPI } from "@/api/dictionary";
/**
 * 用户信息
 * @methods setAccount 设置账号信息
 * @methods setToken 设置token
 * @methods logOut 退出登录
 */
const systemStore = () => {
  // 字典数据
  const dict = ref<any>([]);

  // 设置字典数据
  async function setDictData() {
    const { data } = await getAllDictsAPI();
    dict.value = data.list || [];
  }

  return { dict, setDictData };
};

export const useSystemStore = defineStore("system", systemStore, {
  persist: persistedstateConfig("system", ["dict"])
});
