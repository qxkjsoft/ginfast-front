<template>
    <div class="snow-page">
        <div class="snow-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.name" placeholder="请输入表名" allow-clear />
                        <a-input v-model="form.moduleName" placeholder="请输入模块名称" allow-clear />
                        <a-button type="primary" @click="search">
                            <template #icon><icon-search /></template>
                            <span>查询</span>
                        </a-button>
                        <a-button @click="reset">
                            <template #icon><icon-refresh /></template>
                            <span>重置</span>
                        </a-button>
                    </a-space>
                </template>
                <template #right>
                    <a-space wrap>
                        <a-button type="primary" @click="onImport">
                            <template #icon><icon-import /></template>
                            <span>导入表</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>

            <a-table row-key="id" :data="sysGenList" :bordered="{ cell: true }" :loading="loading"
                :scroll="{ x: '100%', y: '100%', minWidth: 1200 }" :pagination="pagination">
                <template #columns>
                    <a-table-column title="ID" data-index="id" :width="70" align="center"></a-table-column>
                    <a-table-column title="表名" data-index="name" :width="150"></a-table-column>
                    <a-table-column title="目录/模块" data-index="moduleName" :width="150"></a-table-column>
                    <a-table-column title="描述" data-index="describe" :ellipsis="true" :width="200"
                        :tooltip="true"></a-table-column>
                    <a-table-column title="创建时间" data-index="createdAt" :width="180" align="center">
                        <template #cell="{ record }">
                            {{ record.createdAt ? formatTime(record.createdAt) : '-' }}
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="280" align="center" :fixed="isMobile ? '' : 'right'">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link @click="onEdit(record)">
                                    <template #icon><icon-edit /></template>
                                    <span>配置</span>
                                </a-link>
                                <a-popconfirm type="warning" content="确定生成代码吗?" @ok="onGenCode(record)">
                                    <a-link>
                                        <template #icon><icon-code /></template>
                                        <span>生成代码</span>
                                    </a-link>
                                </a-popconfirm>
                                <a-popconfirm type="warning" content="确定同步字段信息吗?" @ok="onRefreshFields(record)">
                                    <a-link>
                                        <template #icon><icon-refresh /></template>
                                        <span>同步</span>
                                    </a-link>
                                </a-popconfirm>
                                <a-popconfirm type="warning" content="确定删除该账号吗?" @ok="onDelete(record)">
                                    <a-link status="danger">
                                        <template #icon><icon-delete /></template>
                                        <span>删除</span>
                                    </a-link>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table-column>
                </template>
            </a-table>
        </div>

        <!-- 导入表对话框 -->
        <a-modal v-model:visible="importVisible" @ok="handleImport" @cancel="afterImportClose"
            :ok-loading="importLoading" :width="layoutMode.width">
            <template #title> 导入表 </template>
            <div>
                <a-space direction="vertical" fill style="width: 100%">
                    <a-alert type="info">
                        选择需要导入的表，系统将自动生成代码生成配置
                    </a-alert>
                    <a-table row-key="tableName" :data="tableList" :bordered="{ cell: true }" :loading="tableLoading"
                        :pagination="false" :scroll="{ x: '100%', y: 400 }" v-model:selectedKeys="selectedTables"
                        :row-selection="{
                            type: 'checkbox',
                            showCheckedAll: true,
                            onlyCurrent: false
                        }">
                        <template #columns>
                            <a-table-column title="表名" data-index="tableName" :width="200"></a-table-column>
                            <a-table-column title="描述" data-index="tableComment.String" :ellipsis="true"
                                :tooltip="true"></a-table-column>
                        </template>
                    </a-table>
                </a-space>
            </div>
        </a-modal>

        <!-- 修改配置抽屉 -->
        <CodegenConfigDrawer v-model:visible="editVisible" :record-id="currentEditId" @success="handleEditSuccess" />
    </div>
</template>

<script setup lang="ts">
import {
    getSysGenListAPI,
    batchInsertSysGenAPI,
    deleteSysGenAPI,
    refreshFields,
    type SysGenItem,
    type SysGenListParams,
} from "@/api/sysgen";

import { generateCode } from "@/api/syscodegen";
import { getTables, type TableInfo } from "@/api/syscodegen";
import { formatTime } from "@/globals";
import CodegenConfigDrawer from './components/codegen-config-drawer.vue';
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
    let info = {
        mobile: {
            width: "95%",
            layout: "vertical"
        },
        desktop: {
            width: "40%",
            layout: "horizontal"
        }
    };
    return isMobile.value ? info.mobile : info.desktop;
});

// 查询表单
const form = ref<SysGenListParams>({
    name: "",
    moduleName: ""
});

// 列表数据
const sysGenList = ref<SysGenItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const pagination = ref({
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showPageSize: true,
    showTotal: true,
    onChange: (page: number) => {
        currentPage.value = page;
        getSysGenList();
    },
    onPageSizeChange: (size: number) => {
        pageSize.value = size;
        currentPage.value = 1;
        getSysGenList();
    }
});

// 获取代码生成配置列表
const getSysGenList = async () => {
    loading.value = true;
    try {
        const params: SysGenListParams = {
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            ...form.value
        };
        const res = await getSysGenListAPI(params);
        if (res.data) {
            sysGenList.value = res.data.list || [];
            total.value = res.data.total || 0;
        }
    } catch (error) {
        console.error("获取代码生成配置列表失败:", error);
        arcoMessage("error", "获取代码生成配置列表失败");
    } finally {
        loading.value = false;
    }
};

// 搜索
const search = () => {
    currentPage.value = 1;
    getSysGenList();
};

// 重置
const reset = () => {
    form.value = {
        name: "",
        moduleName: ""
    };
    currentPage.value = 1;
    getSysGenList();
};

// 导入表相关
const importVisible = ref(false);
const importLoading = ref(false);
const tableList = ref<TableInfo[]>([]);
const tableLoading = ref(false);
const selectedTables = ref<string[]>([]);

// 获取表列表
const getTableList = async () => {
    tableLoading.value = true;
    try {
        const res = await getTables("");
        if (res.data) {
            tableList.value = res.data.tables || [];
        }
    } catch (error) {
        console.error("获取表列表失败:", error);
        arcoMessage("error", "获取表列表失败");
    } finally {
        tableLoading.value = false;
    }
};

// 打开导入对话框
const onImport = () => {
    importVisible.value = true;
    selectedTables.value = [];
    getTableList();
};

// 执行导入
const handleImport = async () => {
    if (selectedTables.value.length === 0) {
        arcoMessage("warning", "请选择要导入的表");
        return false;
    }
    importLoading.value = true;
    try {
        const res = await batchInsertSysGenAPI({
            database: "", // 使用当前连接的数据库
            tables: selectedTables.value
        });

        if (res.data) {
            const { successCount, failedCount } = res.data;
            if (successCount > 0) {
                arcoMessage("success", `成功导入 ${successCount} 个表`);
            }
            if (failedCount > 0) {
                arcoMessage("warning", `有 ${failedCount} 个表导入失败`);
            }
        }

        getSysGenList();
        return true;
    } catch (error) {
        console.error("导入表失败:", error);
        arcoMessage("error", "导入表失败");
        return false;
    } finally {
        importLoading.value = false;
    }
};

// 关闭导入对话框
const afterImportClose = () => {
    importVisible.value = false;
    selectedTables.value = [];
    tableList.value = [];
};

// 删除配置
const onDelete = async (record: SysGenItem) => {
    try {
        // 调用删除API
        await deleteSysGenAPI(record.id);
        arcoMessage("success", "删除成功");
        getSysGenList(); // 刷新列表

    } catch (error) {
        console.error("删除失败:", error);
    }
};

// 修改配置相关
const editVisible = ref(false);
const currentEditId = ref(0);

// 打开修改对话框
const onEdit = (record: SysGenItem) => {
    currentEditId.value = record.id;
    editVisible.value = true;
};

// 处理编辑成功
const handleEditSuccess = () => {
    getSysGenList(); // 刷新列表
};

// 生成代码
const onGenCode = async (record: SysGenItem) => {
    try {
        await generateCode(record.id);
        arcoMessage("success", "代码生成成功");
    } catch (error) {
        console.error("代码生成失败:", error);
    }
}

// 同步字段
const onRefreshFields = async (record: SysGenItem) => {
    try {
        await refreshFields(record.id);
        arcoMessage("success", "字段同步成功");
        getSysGenList(); // 刷新列表
    } catch (error) {
        console.error("字段同步失败:", error);
        arcoMessage("error", "字段同步失败");
    }
}

// 初始化数据
getSysGenList();
</script>

<style lang="scss" scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.drawer-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: var(--color-bg-2);
    border-top: 1px solid var(--color-neutral-3);
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
</style>