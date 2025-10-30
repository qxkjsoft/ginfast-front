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
    if (!iconUrl) {
        // 如果没有传入图标，使用默认图标
        setDefaultFavicon();
        return;
    }

    // 创建测试图片来验证图标是否可加载
    const testImg = new Image();
    testImg.onload = () => {
        // 图标加载成功，移除现有的favicon并设置新图标
        const links = document.querySelectorAll("link[rel='icon']");
        links.forEach(link => {
            link.remove();
        });

        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = iconUrl;
        document.head.appendChild(link);
    };
    testImg.onerror = () => {
        // 图标加载失败，使用默认图标
        console.warn(`图标加载失败: ${iconUrl}，使用默认图标`);
        setDefaultFavicon();
    };
    testImg.src = iconUrl;
};

// 设置默认图标的辅助方法
const setDefaultFavicon = () => {
    const defaultIconUrl = 'src/assets/sys/default.ico';
    const links = document.querySelectorAll("link[rel='icon']");
    links.forEach(link => {
        link.remove();
    });

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = defaultIconUrl;
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
