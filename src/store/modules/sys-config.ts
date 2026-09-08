import { defineStore } from "pinia";
import persistedstateConfig from "@/store/config/index";
import { ref, computed } from "vue";

import { getConfigAPI, updateConfigAPI } from "@/api/sysconfig";
import type {
    SystemConfig,
    SafeConfig,
    CaptchaConfig,
    TenantConfig,
    ConfigRequestData
} from "@/api/sysconfig";
import { handleUrl } from "@/utils/app"
/**
 * 系统配置管理
 * @methods getConfig 获取系统配置
 * @methods updateConfig 更新系统配置
 */
const sysConfigStore = () => {
    // 系统配置数据
    const systemConfig = ref<SystemConfig>({
        systemLogo: "",
        systemIcon: "",
        systemName: "",
        systemCopyright: "",
        systemRecordNo: "",
        defaultusername: "",
        defaultpassword: ""
    });

    // 安全配置数据
    const safeConfig = ref<SafeConfig>({
        loginLockThreshold: 0,
        loginLockExpire: 0,
        loginLockDuration: 0,
        minPasswordLength: 0,
        requireSpecialChar: false
    });

    // 验证码配置数据
    const captchaConfig = ref<CaptchaConfig>({
        open: false,
        length: 0
    });

    // 多租户配置数据（不持久化，每次启动以后端实时配置为准；老后端未返回该段时默认开启）
    const tenantConfig = ref<TenantConfig>({ enabled: true });

    // 配置加载状态
    const loading = ref(false);

    // 多租户是否开启
    const tenantEnabled = computed(() => tenantConfig.value.enabled);

    // 处理后的系统Logo URL
    const systemLogo = computed(() => {
        return handleUrl(systemConfig.value.systemLogo);
    });

    // 处理后的系统Icon URL
    const systemIcon = computed(() => {
        return handleUrl(systemConfig.value.systemIcon);
    });

    // 获取系统配置
    async function getConfig() {
        try {
            loading.value = true;
            const { data } = await getConfigAPI();

            if (data) {
                systemConfig.value = data.system || systemConfig.value;
                safeConfig.value = data.safe || safeConfig.value;
                captchaConfig.value = data.captcha || captchaConfig.value;
                tenantConfig.value = data.tenant || tenantConfig.value;
            }

            return data;
        } catch (error) {
            console.error("获取系统配置失败:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    // 更新系统配置
    async function updateConfig(configData: ConfigRequestData) {
        try {
            loading.value = true;
            const { data } = await updateConfigAPI(configData);

            if (data) {
                // 更新本地配置
                if (configData.system) {
                    systemConfig.value = { ...systemConfig.value, ...configData.system };
                }
                if (configData.safe) {
                    safeConfig.value = { ...safeConfig.value, ...configData.safe };
                }
                if (configData.captcha) {
                    captchaConfig.value = { ...captchaConfig.value, ...configData.captcha };
                }
            }

            return data;
        } catch (error) {
            console.error("更新系统配置失败:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    // 重置配置
    function resetConfig() {
        systemConfig.value = {
            systemLogo: "",
            systemIcon: "",
            systemName: "",
            systemCopyright: "",
            systemRecordNo: "",
            defaultusername: "",
            defaultpassword: ""
        };

        safeConfig.value = {
            loginLockThreshold: 0,
            loginLockExpire: 0,
            loginLockDuration: 0,
            minPasswordLength: 0,
            requireSpecialChar: false
        };

        captchaConfig.value = {
            open: false,
            length: 0
        };

        tenantConfig.value = {
            enabled: true
        };
    }

    return {
        systemConfig,
        safeConfig,
        captchaConfig,
        tenantConfig,
        tenantEnabled,
        loading,
        systemLogo,
        systemIcon,
        getConfig,
        updateConfig,
        resetConfig
    };
};

export const useSysConfigStore = defineStore("sys-config", sysConfigStore, {
    // systemConfig 不持久化：应用启动时经 getConfig() 重新拉取，
    // 且其 defaultusername/defaultpassword（演示账号，仅 demo 模式下发）不应落 localStorage
    persist: persistedstateConfig("sys-config", ["safeConfig", "captchaConfig"])
});