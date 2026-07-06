<template>
    <a-modal width="80%" v-model:visible="modalVisible" :on-before-ok="onConfirmSync" @cancel="onSyncClose"
        :ok-text="'确认同步'" :ok-loading="syncLoading" :mask-closable="false" draggable>
        <template #title>
            <a-space>
                <icon-sync />
                <span>路由同步预览</span>
            </a-space>
        </template>
        <div class="sync-modal-body">
            <!-- 顶部统计 -->
            <a-space wrap class="sync-stats">
                <a-tag color="arcoblue">总计 {{ syncResult.total }}</a-tag>
                <a-tag color="green">新增 {{ syncResult.inserted }}</a-tag>
                <a-tag color="orange">更新 {{ syncResult.updated }}</a-tag>
                <a-tag color="gray">跳过 {{ syncResult.skipped }}</a-tag>
                <a-tag>过滤 {{ syncResult.filtered }}</a-tag>
                <a-tag v-if="syncResult.orphanList && syncResult.orphanList.length" color="red">
                    孤儿 {{ syncResult.orphanList.length }}
                </a-tag>
                <a-tag v-if="syncSelectedKeys.length" color="purple">
                    已选 {{ syncSelectedKeys.length }}
                </a-tag>
            </a-space>

            <!-- 选项开关 -->
            <a-space wrap class="sync-options">
                <a-tooltip content="启用后，已存在的 API 的标题/分组将被代码推导值覆盖；否则只新增、保留手工修改">
                    <a-switch v-model="syncOptions.overwrite" type="round">
                        <template #checked>覆盖已存在</template>
                        <template #unchecked>仅新增(幂等)</template>
                    </a-switch>
                </a-tooltip>
                <a-tooltip content="是否纳入 /api/plugins/* 路由">
                    <a-switch v-model="syncOptions.includePlugins" type="round">
                        <template #checked>含插件</template>
                        <template #unchecked>仅核心</template>
                    </a-switch>
                </a-tooltip>
                <a-tooltip content="插件路由分组是否带 plugins/ 前缀">
                    <a-switch v-model="syncOptions.groupByPlugin" type="round">
                        <template #checked>分组含前缀</template>
                        <template #unchecked>仅插件名</template>
                    </a-switch>
                </a-tooltip>
                <a-switch v-model="showSkipRows" type="round">
                    <template #checked>显示全部</template>
                    <template #unchecked>隐藏跳过</template>
                </a-switch>
            </a-space>

            <!-- 搜索框 -->
            <div class="sync-search">
                <a-input v-model="syncSearchKey" placeholder="搜索API路径" allow-clear style="width: 280px">
                    <template #prefix><icon-search /></template>
                </a-input>
            </div>

            <!-- 明细表格 -->
            <a-table row-key="syncKey" :data="syncTableData" :bordered="{ cell: true }"
                :loading="syncPreviewLoading" :pagination="{ pageSize: 10, showTotal: true }"
                :scroll="{ y: '360px' }" v-model:selectedKeys="syncSelectedKeys"
                :row-selection="{ type: 'checkbox', showCheckedAll: true }"
                :row-class="getSyncRowClass">
                <template #columns>
                    <a-table-column title="动作" :width="90" align="center">
                        <template #cell="{ record }">
                            <a-tag :color="getActionColor(record.action)">{{ getActionText(record.action) }}</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="API路径" data-index="path" :width="240" ellipsis tooltip></a-table-column>
                    <a-table-column title="方法" :width="90" align="center">
                        <template #cell="{ record }">
                            <a-tag :color="getMethodColor(record.method)">{{ record.method }}</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="中文名" data-index="title" :width="160" ellipsis tooltip></a-table-column>
                    <a-table-column title="分组" data-index="apiGroup" :width="140" ellipsis tooltip></a-table-column>
                </template>
            </a-table>

            <!-- 孤儿路由（DB 有但代码无） -->
            <a-collapse v-if="syncResult.orphanList && syncResult.orphanList.length" :default-active-key="[]"
                class="sync-orphan">
                <a-collapse-item key="orphan"
                    :header="`⚠️ 数据库中已不存在的路由 (${syncResult.orphanList.length} 条，仅提示不删除)`">
                    <a-table row-key="syncKey" :data="orphanTableData" :bordered="{ cell: true }"
                        :pagination="{ pageSize: 5 }">
                        <template #columns>
                            <a-table-column title="API路径" data-index="path" :width="240" ellipsis tooltip></a-table-column>
                            <a-table-column title="方法" :width="90" align="center">
                                <template #cell="{ record }">
                                    <a-tag :color="getMethodColor(record.method)">{{ record.method }}</a-tag>
                                </template>
                            </a-table-column>
                            <a-table-column title="中文名" data-index="title" :width="160" ellipsis tooltip></a-table-column>
                            <a-table-column title="分组" data-index="apiGroup" :width="140" ellipsis tooltip></a-table-column>
                        </template>
                    </a-table>
                </a-collapse-item>
            </a-collapse>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import {
    previewSysApiRoutesAPI,
    syncSysApiRoutesAPI,
    type SyncItem,
    type SyncPreviewResult,
    type SysApiSyncParams
} from "@/api/sysapi";
import { Message } from "@arco-design/web-vue";

interface Props {
    visible: boolean;
}

interface Emits {
    (e: "update:visible", value: boolean): void;
    (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 模态框可见性（与 props.visible 双向同步）
const modalVisible = ref(false);
watch(
    () => props.visible,
    (val) => {
        modalVisible.value = val;
        if (val) {
            loadSyncPreview();
        }
    }
);
watch(modalVisible, (val) => {
    if (!val) {
        emit("update:visible", false);
    }
});

const syncPreviewLoading = ref(false);
const syncLoading = ref(false);
// 同步选项（默认全开）
const syncOptions = reactive<SysApiSyncParams>({
    overwrite: true,
    includePlugins: true,
    groupByPlugin: true
});
// 预览结果
const syncResult = ref<SyncPreviewResult>({
    total: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    filtered: 0,
    details: [],
    orphanList: []
});
// 是否显示已跳过的行（默认隐藏）
const showSkipRows = ref(false);
// 搜索关键词（仅匹配路径，不区分大小写）
const syncSearchKey = ref("");
// 用户勾选的行 key 列表（格式 "path|method"）
const syncSelectedKeys = ref<string[]>([]);

// skip 行禁用勾选的样式 class
const getSyncRowClass = (record: SyncItem) => {
    return record.action === "skip" ? "sync-row-disabled" : "";
};

// 表格显示的明细（叠加 showSkipRows + 搜索关键词过滤）
const filteredSyncDetails = computed<SyncItem[]>(() => {
    let list = syncResult.value.details;
    if (!showSkipRows.value) {
        list = list.filter((item) => item.action !== "skip");
    }
    const kw = syncSearchKey.value.trim().toLowerCase();
    if (kw) {
        list = list.filter((item) => item.path.toLowerCase().includes(kw));
    }
    return list;
});

// 主表格实际渲染的数据：注入合成字段 syncKey（path|method）作为 row-key
// Arco Design 的 row-key 仅接受字符串字段名，不支持函数，因此需在数据层预计算
const syncTableData = computed(() => {
    return filteredSyncDetails.value.map((item) => ({
        ...item,
        syncKey: item.path + "|" + item.method
    }));
});

// 孤儿表格也注入 syncKey（与主表一致，避免 row-key 冲突警告）
const orphanTableData = computed(() => {
    return (syncResult.value.orphanList || []).map((item) => ({
        ...item,
        syncKey: item.path + "|" + item.method
    }));
});

// 获取请求方法对应的颜色（组件内自包含的纯函数副本）
const getMethodColor = (method: string) => {
    const colorMap: Record<string, string> = {
        GET: "green",
        POST: "blue",
        PUT: "orange",
        DELETE: "red",
        PATCH: "purple"
    };
    return colorMap[method] || "gray";
};

// 获取动作文本
const getActionText = (action: string) => {
    const map: Record<string, string> = {
        insert: "新增",
        update: "更新",
        skip: "跳过"
    };
    return map[action] || action;
};

// 获取动作颜色
const getActionColor = (action: string) => {
    const map: Record<string, string> = {
        insert: "green",
        update: "orange",
        skip: "gray"
    };
    return map[action] || "gray";
};

// 加载预览数据
const loadSyncPreview = async () => {
    syncPreviewLoading.value = true;
    try {
        const { data } = await previewSysApiRoutesAPI({
            overwrite: syncOptions.overwrite,
            includePlugins: syncOptions.includePlugins,
            groupByPlugin: syncOptions.groupByPlugin
        });
        syncResult.value = data;
        // 预览刷新后清空勾选（默认全不选，用户手动勾选）
        syncSelectedKeys.value = [];
    } catch (error) {
        console.error("预览路由同步失败", error);
        Message.error("预览路由同步失败");
    } finally {
        syncPreviewLoading.value = false;
    }
};

// 选项变化自动重新预览
watch(
    () => ({ ...syncOptions }),
    () => {
        if (modalVisible.value) {
            loadSyncPreview();
        }
    }
);

// 关闭弹窗
const onSyncClose = () => {
    syncResult.value = {
        total: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        filtered: 0,
        details: [],
        orphanList: []
    };
    syncSelectedKeys.value = [];
    syncSearchKey.value = "";
};

// 确认同步
const onConfirmSync = async () => {
    // 必须勾选至少一条路由
    if (syncSelectedKeys.value.length === 0) {
        Message.warning("请勾选要同步的路由");
        return false;
    }
    syncLoading.value = true;
    try {
        const { data } = await syncSysApiRoutesAPI({
            overwrite: syncOptions.overwrite,
            includePlugins: syncOptions.includePlugins,
            groupByPlugin: syncOptions.groupByPlugin,
            selectedKeys: syncSelectedKeys.value
        });
        Message.success(`同步成功：新增 ${data.inserted} 条，更新 ${data.updated} 条`);
        emit("success");
        return true;
    } catch (error) {
        console.error("路由同步失败", error);
        Message.error("路由同步失败");
        return false;
    } finally {
        syncLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.sync-modal-body {
    .sync-stats {
        margin-bottom: 12px;
    }

    .sync-options {
        margin-bottom: 12px;
        padding: 8px 12px;
        background: var(--color-fill-1);
        border-radius: 4px;
    }

    .sync-search {
        margin-bottom: 12px;
    }

    .sync-orphan {
        margin-top: 12px;
    }

    // skip 行禁用勾选框
    :deep(.sync-row-disabled) {
        .arco-checkbox {
            pointer-events: none;
            opacity: 0.4;
        }
    }
}
</style>
