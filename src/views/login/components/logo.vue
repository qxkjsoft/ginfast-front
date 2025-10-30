<template>
    <div class="banner_title">
        <!-- <img v-if="sysLogo" :src="sysLogo" alt="系统logo" style="width: 40px; height: 40px;" />
        <s-svg-icon v-else name="snow" size="40" /> -->
        <LogoSvg :defaultImageUrl="sysLogo" :width="40" :height="40" />
        {{ bannerTitle }}
    </div>
</template>
<script setup lang='ts'>
import { handleUrl } from "@/utils/app"
import { useSysConfigStore } from "@/store/modules/sys-config";
import { storeToRefs } from "pinia";
import LogoSvg from "@/components/s-logo/index.vue";

// 获取系统配置
const sysConfigStore = useSysConfigStore();
const { systemConfig } = storeToRefs(sysConfigStore);

// 全局title
const title = import.meta.env.VITE_GLOB_APP_TITLE;
// 从系统配置中获取logo
const sysLogo = computed(() => {
    return handleUrl(systemConfig.value?.systemLogo);
});
// 从系统配置中获取标题
const bannerTitle = computed(() => {
    return systemConfig.value?.systemName || title;
});

</script>
<style lang='scss' scoped>
.banner_title {
    position: absolute;
    display: flex;
    top: 30px;
    left: 30px;
    column-gap: $margin-text;
    align-items: center;
    font-size: $font-size-title-2;
    font-weight: bold;
    color: $color-primary;
}
</style>