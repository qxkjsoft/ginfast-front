<template>
    <a-layout-footer class="footer">
        <div class="footer_title" @click="onFooter">{{ systemCopyright }} {{ systemRecordNo }}</div>
        <a-popover v-if="tenantEnabled && tenantID > 0" position="tl">
            <div v-if="tenantID > 0" class="footer_tenant">{{ `[当前租户:${tenantName}]`  }}</div>
            <template #content>
                <p>租户ID: {{ tenantID }}</p>
                <p>租户编码: {{ tenantCode }}</p>
                <p>租户名称: {{ tenantName }}</p>
                <p>租户域名: {{ tenantDomain }}</p>
            </template>
        </a-popover>
        
    </a-layout-footer>
</template>

<script setup lang="ts">

import { useSysConfigStore } from "@/store/modules/sys-config";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/modules/user";

// 获取用户模块
const userStore = useUserStore();
const { account } = storeToRefs(userStore);

// 获取系统配置
const sysConfigStore = useSysConfigStore();
const { systemConfig, tenantEnabled } = storeToRefs(sysConfigStore);

// 从系统配置中获取版权信息
const systemCopyright = computed(() => {
    return systemConfig.value?.systemCopyright || "";
});

// 从系统配置中获取备案号
const systemRecordNo = computed(() => {
    return systemConfig.value?.systemRecordNo || "";
});



// 所在租户名称
const tenantName = computed(() => {
    return account.value.tenantName || "";
});
// 所在租户ID
const tenantID = computed(() => {
    return account.value.tenantID || 0;
});

// 所在租户Code
const tenantCode = computed(() => {
    return account.value.tenantCode || "";
});

// 所在租户域名
const tenantDomain = computed(() => {
    return account.value.tenantDomain || "";
});



const onFooter = () => {
    window.open("https://github.com/qxkjsoft/ginfast-back", "_blank");
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

.footer_tenant {
    margin-right: 20px;
    color: $color-text-4;
}
</style>
