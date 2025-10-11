<template>
    <div>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import { useThemeMethods } from "@/hooks/useThemeMethods";
import { useSysConfigStore } from "@/store/modules/sys-config";
import { watch } from "vue";

// 初始化主题
const onTheme = () => {
    let { initTheme } = useThemeMethods();
    initTheme();
};
onTheme();

// 初始化系统配置
const initSysConfig = () => {
    const sysConfigStore = useSysConfigStore();
    // 获取系统配置，不等待完成，避免阻塞应用启动
    sysConfigStore.getConfig().then(() => {
        //console.log("系统图标:", sysConfigStore.systemIcon);
        // 设置网站图标
        setFavicon(sysConfigStore.systemIcon);
        // 设置网站标题
        setTitle(sysConfigStore.systemConfig.systemName);
    }).catch((error: unknown) => {
        console.warn("获取系统配置失败，将使用默认配置:", error);
    });
};

// 设置网站图标
const setFavicon = (iconUrl: string) => {
    if (!iconUrl) return;

    // 移除现有的favicon
    const links = document.querySelectorAll("link[rel='icon']");
    links.forEach(link => {
        link.remove();
    });

    // 创建新的favicon链接
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = iconUrl;
    document.head.appendChild(link);
};

// 设置网站标题
const setTitle = (title: string) => {
    if (title) {
        document.title = title;
    }
};

// 监听系统配置变化
const sysConfigStore = useSysConfigStore();
watch(
    () => sysConfigStore.systemIcon,
    (newIcon) => {
        if (newIcon) {
            setFavicon(newIcon);
        }
    },
    { immediate: true }
);

// 监听系统名称变化
watch(
    () => sysConfigStore.systemConfig.systemName,
    (newName) => {
        if (newName) {
            setTitle(newName);
        }
    },
    { immediate: true }
);

initSysConfig();
</script>

<style lang="scss" scoped></style>