<template>
  <a-watermark :content="watermark" v-bind="watermarkConfig">
    <a-layout-content class="layout-main-content">
      <Tabs v-if="isTabs" />
      <router-view v-slot="{ Component, route }">
        <s-main-transition>
          <keep-alive :include="cacheRoutes">
            <component :is="createComponentWrapper(Component, route)" :key="route.fullPath" v-if="refreshPage" />
          </keep-alive>
        </s-main-transition>
      </router-view>
    </a-layout-content>
  </a-watermark>
</template>

<script setup lang="ts">
import Tabs from "@/layout/components/Tabs/index.vue";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "@/store/modules/theme-config";
import { useRouteConfigStore } from "@/store/modules/route-config";
const themeStore = useThemeConfig();
let { refreshPage, isTabs, watermark, watermarkStyle, watermarkRotate, watermarkGap } = storeToRefs(themeStore);
const routerStore = useRouteConfigStore();
const { cacheRoutes } = storeToRefs(routerStore);

// 组件包装器
const wrapperMap = new Map();
// 为每个路由创建一个独立的组件包装器（wrapper），使 <keep-alive> 能够正确缓存同一个组件在不同路由下的多个实例。
const createComponentWrapper = (component: any, route: any) => {
  // 守卫：组件不存在（如路由未匹配到）则直接返回
  if (!component) return;
  // 如果路由未开启 keepAlive 缓存，则无需包装，直接渲染原始组件
  if (!route.meta?.keepAlive) return h(component);
  // 使用路由完整路径（含参数）作为包装器的唯一标识名
  const wrapperName = route.fullPath;
  // 从缓存 Map 中查找是否已存在该路径对应的包装器
  let wrapper = wrapperMap.get(wrapperName);
  if (!wrapper) {
    // 创建包装器组件：name 用于 keep-alive 的 include 匹配，render 返回原始组件的 VNode
    wrapper = { name: wrapperName, render: () => h(component) };
    // 将包装器存入 Map 缓存，避免重复创建
    wrapperMap.set(wrapperName, wrapper);
  }
  // 渲染包装器组件（而非直接渲染原始组件），使 keep-alive 能按 fullPath 独立缓存
  return h(wrapper);
};

// 水印配置
const watermarkConfig = computed(() => {
  return {
    font: watermarkStyle.value,
    rotate: watermarkRotate.value,
    gap: watermarkGap.value
  };
});

watch(watermarkConfig, newv => {
  console.log(newv);
});
</script>

<style lang="scss" scoped>
.layout-main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// 修改左侧滚动条宽度-主要针对main窗口内的滚动条
:deep(.arco-scrollbar-thumb-direction-vertical .arco-scrollbar-thumb-bar) {
  width: 4px;
  margin-left: 8px;
}
</style>
