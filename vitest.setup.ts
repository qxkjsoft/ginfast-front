import { vi } from "vitest";

// node 测试环境无 localStorage，而 store 模块链在模块作用域就会读取它
// （theme-config 的 persistedstateConfig 在 defineStore 的 persist 选项里直接引用 localStorage），
// 这里提供最小内存实现，使 store 单测可以导入真实模块
const memoryStorage = new Map<string, string>();
const localStorageStub = {
    getItem: (key: string) => (memoryStorage.has(key) ? memoryStorage.get(key)! : null),
    setItem: (key: string, value: string) => void memoryStorage.set(key, String(value)),
    removeItem: (key: string) => void memoryStorage.delete(key),
    clear: () => memoryStorage.clear()
};
vi.stubGlobal("localStorage", localStorageStub);
