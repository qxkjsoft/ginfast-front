<template>
    <a-layout-footer class="footer">
        <div class="footer_title" @click="onFooter">{{ systemCopyright }} {{ systemRecordNo }}</div>
    </a-layout-footer>
</template>

<script setup lang="ts">

import { useSysConfigStore } from "@/store/modules/sys-config";
import { storeToRefs } from "pinia";


// 获取系统配置
const sysConfigStore = useSysConfigStore();
const { systemConfig } = storeToRefs(sysConfigStore);

// 从系统配置中获取版权信息
const systemCopyright = computed(() => {
    return systemConfig.value?.systemCopyright || "";
});

// 从系统配置中获取备案号
const systemRecordNo = computed(() => {
    return systemConfig.value?.systemRecordNo || "";
});
const onFooter = () => {
    //window.open("https://github.com/WangFan-io/SnowAdmin", "_blank");
};
</script>

<style lang="scss" scoped>
.footer {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 30px;
    border-top: $border-1 solid $color-border-2;
}

.footer_title {
    margin: 0 auto;
    color: $color-text-4;
    text-align: center;
    cursor: pointer;
}
</style>
