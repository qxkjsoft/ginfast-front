<template>
    <div :class="layoutType == 'layoutHead' ? 'logo_head no-border' : 'logo_head'">
        <div class="logo_box" :class="(collapsed || layoutType == 'layoutHead') && 'padding-unset'">
            <img v-if="sysLogo" :src="sysLogo" alt="系统logo" style="width: 30px; height: 30px;" />
            <s-svg-icon v-else name="snow" :size="30" />
            <span :class="isDark ? 'logo_title dark' : 'logo_title'" v-if="isTitle">{{ bannerTitle }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useThemeConfig } from "@/store/modules/theme-config";
const themeStore = useThemeConfig();
const { collapsed, asideDark, layoutType } = storeToRefs(themeStore);
import { handleUrl } from "@/utils/app"
import { useSysConfigStore } from "@/store/modules/sys-config";


// 获取系统配置
const sysConfigStore = useSysConfigStore();
const { systemConfig } = storeToRefs(sysConfigStore);

// 全局title
const title = import.meta.env.VITE_GLOB_APP_TITLE;



// 从系统配置中获取标题
const bannerTitle = computed(() => {
    return systemConfig.value?.systemName || title;
});

// 从系统配置中获取logo
const sysLogo = computed(() => {
    return handleUrl(systemConfig.value?.systemLogo);
});




// 黑暗模式的文字渲染
const isDark = computed(() => {
    if (asideDark.value && layoutType.value != "layoutHead") {
        return true;
    } else {
        return false;
    }
});

// 是否展示标题
const isTitle = computed(() => {
    if (!collapsed.value || layoutType.value == "layoutHead") {
        return true;
    } else {
        return false;
    }
});
</script>

<style lang="scss" scoped>
// 头部
.logo_head {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 60px;
    border-right: $border-1 solid $color-border-2;

    .logo_box {
        display: flex;
        column-gap: $padding;
        align-items: center;
        width: 100%;
        padding: 0 $padding;
        overflow: hidden;
    }

    // 折叠或者是横向布局-去掉padding，logo居中
    .padding-unset {
        justify-content: space-around;
        padding: unset;
    }

    .logo_title {
        box-sizing: border-box;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: $font-size-title-2;
        font-weight: bold;
        text-align: left;
        white-space: nowrap;
    }

    .dark {
        color: #ffffff;
    }
}

.no-border {
    border: unset;
}
</style>
