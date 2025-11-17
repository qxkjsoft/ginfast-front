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
                        <a-button type="primary" @click="onImport" v-hasPerm="['system:codegen:batchInsert']">
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
                                <a-link @click="onEdit(record)" v-hasPerm="['system:codegen:update']">
                                    <span>配置</span>
                                </a-link>
                                <a-link @click="onPreview(record)" v-hasPerm="['system:codegen:preview']">
                                    <span>预览</span>
                                </a-link>
                                <a-popconfirm type="warning" content="确定生成代码吗?" @ok="onGenCode(record)">
                                    <a-link v-hasPerm="['system:codegen:generate']">
                                        <span>生成</span>
                                    </a-link>
                                </a-popconfirm>
                                <a-popconfirm type="warning" content="确定同步字段信息吗?" @ok="onRefreshFields(record)">
                                    <a-link v-hasPerm="['system:codegen:refreshFields']">
                                        <span>同步</span>
                                    </a-link>
                                </a-popconfirm>
                                <a-popconfirm type="warning" content="确定删除该账号吗?" @ok="onDelete(record)">
                                    <a-link status="danger" v-hasPerm="['system:codegen:delete']">
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

        <!-- 代码预览模态框 -->
        <a-modal v-model:visible="previewVisible" :title="previewTitle" width="100%" :body-style="{ padding: '0px', height: '600px', display: 'flex', flexDirection: 'column' }" :ok-text="null" :cancel-text="null">
            <div class="preview-modal-container">
                <!-- 加载状态 -->
                <div v-if="previewLoading" class="preview-loading">
                    <a-spin tip="正在加载代码预览..." />
                </div>
                
                <!-- 空状态 -->
                <div v-else-if="!hasPreviewData" class="preview-empty">
                    <icon-file class="empty-icon" />
                    <div class="empty-text">暂无代码预览数据</div>
                </div>
                
                <!-- 代码预览内容 -->
                <div v-else class="preview-content">
                    <!-- 标签按钮 -->
                    <div class="preview-tabs-header">
                        <a-button v-if="previewData.model" :type="activeTab === 'model' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'model'">
                            Model
                        </a-button>
                        <a-button v-if="previewData.modelparam" :type="activeTab === 'modelparam' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'modelparam'">
                            ModelParam
                        </a-button>
                        <a-button v-if="previewData.controller" :type="activeTab === 'controller' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'controller'">
                            Controller
                        </a-button>
                        <a-button v-if="previewData.service" :type="activeTab === 'service' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'service'">
                            Service
                        </a-button>
                        <a-button v-if="previewData.routes" :type="activeTab === 'routes' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'routes'">
                            Routes
                        </a-button>
                        <a-button v-if="previewData.init" :type="activeTab === 'init' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'init'">
                            Init
                        </a-button>
                        <a-button v-if="previewData.frontendApi" :type="activeTab === 'frontendApi' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'frontendApi'">
                            Frontend API
                        </a-button>
                        <a-button v-if="previewData.frontendStore" :type="activeTab === 'frontendStore' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'frontendStore'">
                            Frontend Store
                        </a-button>
                        <a-button v-if="previewData.frontendView" :type="activeTab === 'frontendView' ? 'primary' : 'secondary'" size="small" @click="activeTab = 'frontendView'">
                            Frontend View
                        </a-button>
                    </div>
                    
                    <!-- 代码展示区 -->
                    <div class="preview-content-body">
                        <div v-if="activeTab === 'model' && previewData.model" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('model')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">Go Model 文件</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.model" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'modelparam' && previewData.modelparam" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('modelparam')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">Go 参数结构体</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.modelparam" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'controller' && previewData.controller" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('controller')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">Go 控制器</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.controller" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'service' && previewData.service" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('service')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">Go 服务层</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.service" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'routes' && previewData.routes" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('routes')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">路由配置</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.routes" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'init' && previewData.init" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('init')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">初始化文件</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.init" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'frontendApi' && previewData.frontendApi" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('frontendApi')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">前端 API 文件</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.frontendApi" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'frontendStore' && previewData.frontendStore" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('frontendStore')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">前端 Store 文件</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.frontendStore" type="javascript" />
                            </div>
                        </div>
                        
                        <div v-if="activeTab === 'frontendView' && previewData.frontendView" class="code-wrapper">
                            <div class="code-header">
                                <a-button type="primary" size="small" @click="copyCode('frontendView')">
                                    <template #icon><icon-copy /></template>
                                    <span>复制代码</span>
                                </a-button>
                                <div class="code-info">前端页面文件</div>
                            </div>
                            <div class="code-container">
                                <s-code-view :code-json="previewData.frontendView" type="javascript" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
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

import { generateCode, previewCode } from "@/api/syscodegen";
import { getTables, type TableInfo } from "@/api/syscodegen";
import { formatTime } from "@/globals";
import CodegenConfigDrawer from './components/codegen-config-drawer.vue';
import SCodeView from "@/components/s-code-view/index.vue";
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
    let info = {
        mobile: {
            width: "95%",
            drawerWidth: "100%",
            layout: "vertical"
        },
        desktop: {
            width: "40%",
            drawerWidth: "75%",
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

// 预览
const previewVisible = ref(false);
const previewTitle = ref("");
const previewLoading = ref(false);
const activeTab = ref("model");
const previewData = ref<{
    model?: string,
    modelparam?: string,
    controller?: string,
    service?: string,
    routes?: string,
    init?: string,
    frontendApi?: string,
    frontendStore?: string,
    frontendView?: string
}>({
    model: "",
    modelparam: "",
    controller: "",
    service: "",
    routes: "",
    init: "",
    frontendApi: "",
    frontendStore: "",
    frontendView: ""
});

// 检查是否有预览数据
const hasPreviewData = computed(() => {
    return Object.values(previewData.value).some(value => value && value.trim() !== '');
});

const onPreview = async (record: SysGenItem) => {
    previewVisible.value = true;
    previewTitle.value = `${record.name} - 代码预览`;
    previewLoading.value = true;
    activeTab.value = "model";
    // 重置预览数据
    previewData.value = {
        model: "",
        modelparam: "",
        controller: "",
        service: "",
        routes: "",
        init: "",
        frontendApi: "",
        frontendStore: "",
        frontendView: ""
    };
    try {
        const res = await previewCode(record.id);
        if (res.data && res.data.preview) {
            // 格式化代码
            const preview = res.data.preview;
            previewData.value = {
                model: formatCode(preview.model),
                modelparam: formatCode(preview.modelparam),
                controller: formatCode(preview.controller),
                service: formatCode(preview.service),
                routes: formatCode(preview.routes),
                init: formatCode(preview.init),
                frontendApi: formatCode(preview.frontendApi),
                frontendStore: formatCode(preview.frontendStore),
                frontendView: formatCode(preview.frontendView)
            };
        }
    } catch (error) {
        console.error("预览代码失败:", error);
        arcoMessage("error", "预览代码失败");
    } finally {
        previewLoading.value = false;
    }
};

// 处理代码字符串中的特殊字符
const formatCode = (code: string | undefined) => {
    if (!code) return '';
    // 处理 \r\n\t 等特殊字符
    return code
        .replace(/\r\n/g, '\n')  // Windows换行符转Unix换行符
        .replace(/\r/g, '\n')    // Mac换行符转Unix换行符
        .replace(/\t/g, '    '); // 制表符转4个空格
};

// 复制代码
const copyCode = (key: string) => {
    const code = previewData.value[key as keyof typeof previewData.value];
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            arcoMessage("success", "代码已复制到剪贴板");
        }).catch(() => {
            arcoMessage("error", "复制失败，请手动复制");
        });
    }
};


onMounted(() => {
    // 初始化数据
    getSysGenList();
});

</script>

<style lang="scss" scoped>
.preview-modal-container {
  display: flex;
  flex-direction: column;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-tabs-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-2);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.preview-content-body {
  flex: 1;
}

.preview-loading,
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.preview-empty {
  .empty-icon {
    font-size: 48px;
    color: var(--color-text-3);
  }
  
  .empty-text {
    color: var(--color-text-3);
    font-size: 14px;
  }
}

.code-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 12px;
  }
  
  .code-container {
    flex: 1;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
  }
}
</style>