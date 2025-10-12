<template>
    <div class="banner_box">
        <div class="banner_title">
            <img v-if="sysLogo" :src="sysLogo" alt="系统logo" style="width: 25px; height: 25px;" />
            <s-svg-icon v-else name="snow" size="25" />
            {{ bannerTitle }}
        </div>
        <div class="banner_img">
            <s-svg-icon name="数据时代" size="100%" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { handleUrl } from "@/utils/app"
import { useSysConfigStore } from "@/store/modules/sys-config";
import { storeToRefs } from "pinia";


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



</script>

<style lang="scss" scoped>
.banner_box {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 650px;
    height: 100%;
    padding: 30px;

    .banner_title {
        position: absolute;
        display: flex;
        column-gap: $margin-text;
        align-items: center;
        font-size: $font-size-title-1;
        font-weight: bold;
        color: $color-primary;
    }

    .banner_img {
        flex: 1;
    }
}
</style>
