<template>
    <div class="container">
        <Logo />
        <div class="login">
            <LoginBanner v-if="isPc" />
            <div class="login_box">
                <div class="login_title">Welcome Back</div>
                <div class="login_title_desc">国际化，路由配置，状态管理应有尽有</div>
                <div class="login_title_desc">丰富的的页面模板，覆盖大多数典型业务场景</div>
                <LoginForm />
            </div>
        </div>
        <!-- 版权信息和备案号 -->
        <div class="copyright-info" v-if="systemCopyright || systemRecordNo">
            <div class="copyright-text" v-if="systemCopyright">{{ systemCopyright }}</div>
            <div class="record-text" v-if="systemRecordNo">{{ systemRecordNo }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

import LoginBanner from "@/views/login/components/login-banner.vue";
import LoginForm from "@/views/login/components/login-form.vue";
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isPc } = useDevicesSize();

import { useSysConfigStore } from "@/store/modules/sys-config";
import { storeToRefs } from "pinia";

// 系统logo
import Logo from "@/views/login/components/logo.vue";



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
</script>

<style lang="scss" scoped>
.container {
    position: relative;
    height: 100vh;
    overflow: hidden;
    background-image: url('@/assets/img/login-bg.jpg');
    /* 设置背景图 */
    background-size: cover;
    /* 覆盖整个容器 */
    background-position: center;
    /* 居中显示 */
    background-repeat: no-repeat;

    /* 不重复 */
    .login {
        position: absolute;
        top: 50%;
        left: 50%;
        display: flex;
        align-items: center;
        max-width: 1000px;
        height: 500px;

        transform: translate(-50%, -50%);

        .login_box {
            position: relative;
            box-sizing: border-box;
            width: 350px;
            height: 100%;
            padding: 40px 30px 30px;
            box-shadow: 0 0 8px 1px $color-fill-2;
            background-color: #fff;

            .login_title {
                margin-bottom: $margin-text;
                font-size: $font-size-title-2;
                color: $color-text-1;
            }

            .login_title_desc {
                font-size: $font-size-body-1;
                color: $color-text-3;
            }

            .author {
                position: absolute;
                bottom: 30px;
                font-size: $font-size-body-1;
                color: $color-text-4;
            }
        }
    }


    .copyright-info {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        text-align: center;
        padding: 0 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        .copyright-text {
            font-size: $font-size-body-3;
            color: $color-text-4;
        }

        .record-text {
            margin-left: 5px;
            font-size: $font-size-body-3;
            color: $color-text-4;
        }
    }
    @media (max-width: 768px) {
        .copyright-info {
            flex-direction: column;
            
            .record-text {
                margin-left: 0;
                margin-top: 5px;
            }
        }
    }
}
</style>
