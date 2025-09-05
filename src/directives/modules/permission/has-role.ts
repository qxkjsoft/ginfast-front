import { Directive } from "vue";
//import { useUserInfoStore } from "@/store/modules/user-info";
import { useUserStoreHook } from "@/store/modules/user";
/**
 * 检测指令绑定值是否为空
 * @param value 指令绑定值
 * @returns {Array<string>} 指令绑定值数组
 */
const bindingValueEmpty = (value: unknown): Array<number> => {
  // 处理未定义或空值情况
  if (!value) throw new Error("v-hasRole 指令需要配置权限标识");

  // 标准化为数组格式
  // 如果 value 是一个数组，则直接返回该数组
  // 如果 value 不是数组，则将其转换为包含单个字符串元素的数组
  return Array.isArray(value) ? (value as number[]) : [Number(value)];
};

/**
 * 检查自定义指令权限
 * @param {HTMLElement} el dom元素
 * @param {unknown} bindingValue 指令绑定值
 */
const checkRole = (el: HTMLElement, bindingValue: unknown) => {
  try {
    // 检测自定义指令值并转化为数组格式
    const requiredRole = bindingValueEmpty(bindingValue);

    // 超级管理员标识
    //const super_admin = 1;

    // 获取用户权限标识-Array[string]
    //let { roles } = useUserInfoStore().account;
    let { roles } = useUserStoreHook().account;
    // 如果是超级管理员则放行
    //if (roles.includes(super_admin)) return;

    // 是否有权限
    const hasRole = requiredRole.some((perm: number) => roles.includes(perm));

    // 无权限、父节点存在时，删除当前节点
    if (!hasRole && el.parentNode) el.parentNode.removeChild(el);
  } catch (error) {
    console.error(`权限指令错误: ${error}`);
    // 删除当前节点
    if (el.parentNode) el.parentNode.removeChild(el);
  }
};

const hasPerm: Directive = {
  mounted: (el, binding) => checkRole(el, binding.value),
  updated: (el, binding) => checkRole(el, binding.value)
};

export default hasPerm;
