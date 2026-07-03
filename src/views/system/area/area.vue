<template>
    <div class="snow-page">
        <div class="snow-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.keyword" placeholder="名称/编码" allow-clear
                            @press-enter="onSearch" style="width: 200px" />
                        <a-button type="primary" @click="onSearch">
                            <template #icon><icon-search /></template>
                            <span>搜索</span>
                        </a-button>
                        <a-button @click="onResetSearch" v-if="searchMode">
                            <template #icon><icon-refresh /></template>
                            <span>返回树形</span>
                        </a-button>
                    </a-space>
                </template>
                <template #right>
                    <a-space wrap>
                        <a-button @click="demoVisible = true">
                            <template #icon><icon-code /></template>
                            <span>组件演示</span>
                        </a-button>
                        <a-button type="primary" status="success" :loading="initLoading"
                            @click="onInitData" v-hasPerm="['system:area:initData']">
                            <template #icon><icon-sync /></template>
                            <span>初始化数据</span>
                        </a-button>
                        <a-button type="primary" @click="onAdd" v-hasPerm="['system:area:add']">
                            <template #icon><icon-plus /></template>
                            <span>新增</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>
            <!-- 树形懒加载表格 -->
            <a-table v-if="!searchMode" ref="tableRef" :data="areaList" :load-more="loadMore"
                :bordered="{ cell: true }" row-key="value" :pagination="false" :loading="loading">
                <template #columns>
                    <a-table-column title="地区编码" data-index="value" :width="140"></a-table-column>
                    <a-table-column title="地区名称" :width="200">
                        <template #cell="{ record }">{{ record.label }}</template>
                    </a-table-column>
                    <a-table-column title="层级" data-index="level" align="center" :width="80"></a-table-column>
                    <a-table-column title="父级编码" data-index="parent" align="center" :width="140"></a-table-column>
                    <a-table-column title="操作" align="center" :fixed="isMobile ? '' : 'right'" :width="280">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link v-hasPerm="['system:area:edit']" @click="onUpdate(record)">
                                    <template #icon><icon-edit /></template>
                                    <span>修改</span>
                                </a-link>
                                <a-link v-if="Number(record.level) < 4" v-hasPerm="['system:area:add']"
                                    status="success" @click="onAddChild(record.value)">
                                    <template #icon><icon-plus /></template>
                                    <span>新增下级</span>
                                </a-link>
                                <a-popconfirm type="warning" :content="deleteTip(record)"
                                    @ok="onDelete(record)">
                                    <a-link v-hasPerm="['system:area:delete']" status="danger">
                                        <template #icon><icon-delete /></template>
                                        <span>删除</span>
                                    </a-link>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table-column>
                </template>
            </a-table>

            <!-- 搜索结果扁平表格 -->
            <a-table v-else :data="searchResults" :bordered="{ cell: true }" row-key="value"
                :pagination="{ pageSize: 20 }" :loading="searchLoading">
                <template #columns>
                    <a-table-column title="地区编码" data-index="value" :width="140"></a-table-column>
                    <a-table-column title="地区名称" data-index="label" :width="160"></a-table-column>
                    <a-table-column title="完整路径" data-index="pathText" :ellipsis="true"
                        :tooltip="true"></a-table-column>
                    <a-table-column title="层级" data-index="level" align="center" :width="80"></a-table-column>
                    <a-table-column title="操作" align="center" :width="260">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link v-hasPerm="['system:area:edit']" @click="onUpdate(record)">
                                    <template #icon><icon-edit /></template>
                                    <span>修改</span>
                                </a-link>
                                <a-popconfirm type="warning" :content="deleteTip(record)"
                                    @ok="onDelete(record)">
                                    <a-link v-hasPerm="['system:area:delete']" status="danger">
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

        <!-- 新增/编辑弹窗 -->
        <a-modal :width="layoutMode.width" v-model:visible="open" @close="afterClose"
            :on-before-ok="handleOk" @cancel="afterClose">
            <template #title>{{ title }}</template>
            <div>
                <a-form ref="formRef" :layout="layoutMode.layout" auto-label-width :rules="rules"
                    :model="addFrom">
                    <a-form-item v-if="formType !== 1" field="parent" label="上级地区">
                        <area-tree-select v-model="addFrom.parent" :max-level="3"
                            :key="treeSelectKey" placeholder="留空则为顶级地区" />
                    </a-form-item>
                    <a-row :gutter="24">
                        <a-col :span="12">
                            <a-form-item field="value" label="地区编码" validate-trigger="blur">
                                <a-input v-model="addFrom.value" placeholder="请输入地区编码" allow-clear />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item field="label" label="地区名称" validate-trigger="blur">
                                <a-input v-model="addFrom.label" placeholder="请输入地区名称" allow-clear />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24">
                        <a-col :span="12">
                            <a-form-item field="sort" label="排序">
                                <a-input-number v-model="addFrom.sort" placeholder="排序值" :min="0"
                                    :max="9999" :step="1" :precision="0" allow-clear style="width: 100%" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
        </a-modal>

        <!-- 组件演示弹窗 -->
        <a-modal :width="layoutMode.width" v-model:visible="demoVisible" title="地区选择组件演示"
            :footer="false" @cancel="resetDemo">
            <div style="margin-bottom: 24px">
                <h4>单选级联 (SelectArea)</h4>
                <select-area v-model="demoAreaValue" />
                <div v-if="demoAreaValue" style="margin-top: 8px">
                    选中的值: <a-tag>{{ demoAreaValue }}</a-tag>
                </div>
                <div v-else style="margin-top: 8px; color: var(--color-text-3); font-size: 12px;">
                    请在上方选择一个地区
                </div>
            </div>
            <div style="margin-bottom: 24px">
                <h4>多选级联 (SelectAreaMultiple)</h4>
                <select-area-multiple v-model="demoAreaValues" />
                <div v-if="demoAreaValues.length" style="margin-top: 8px">
                    选中的值:
                    <a-tag v-for="v in demoAreaValues" :key="v" style="margin: 2px">{{ v }}</a-tag>
                </div>
                <div v-else style="margin-top: 8px; color: var(--color-text-3); font-size: 12px;">
                    请在上方选择地区
                </div>
            </div>
            <div>
                <h4>树形选择 (AreaTreeSelect)</h4>
                <area-tree-select v-model="demoTreeValue" />
                <div v-if="demoTreeValue" style="margin-top: 8px">
                    选中的值: <a-tag>{{ demoTreeValue }}</a-tag>
                </div>
                <div v-else style="margin-top: 8px; color: var(--color-text-3); font-size: 12px;">
                    请在上方选择一个地区
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import {
    getAreaListAPI,
    getAreaChildrenAPI,
    searchAreaAPI,
    addAreaAPI,
    updateAreaAPI,
    deleteAreaAPI,
    initAreaDataAPI,
    refreshAreaData,
    type AreaItem,
    type AreaSearchItem,
    type AreaFormData
} from "@/api/area";
import AreaTreeSelect from "@/components/select-area/tree.vue";
import SelectArea from "@/components/select-area/index.vue";
import SelectAreaMultiple from "@/components/select-area/multiple.vue";
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
    const info = {
        mobile: { width: "95%", layout: "vertical" },
        desktop: { width: "44%", layout: "horizontal" }
    };
    return isMobile.value ? info.mobile : info.desktop;
});

// ===== 列表数据 =====
const loading = ref(false);
const areaList = ref<AreaItem[]>([]);

const getRootList = async () => {
    loading.value = true;
    try {
        const res = await getAreaListAPI();
        areaList.value = res.data.list || [];
    } catch (error) {
        console.error("获取地区列表失败:", error);
        arcoMessage("error", "获取地区列表失败");
        areaList.value = [];
    }
    loading.value = false;
};

// 懒加载子节点（Arco Table load-more callback 风格）
const loadMore = async (record: AreaItem, done: (children?: AreaItem[]) => void) => {
    try {
        const res = await getAreaChildrenAPI(record.value);
        done(res.data.list || []);
    } catch {
        done([]);
    }
};

// ===== 搜索 =====
const searchMode = ref(false);
const searchLoading = ref(false);
const searchResults = ref<AreaSearchItem[]>([]);
const form = ref({ keyword: "" });

const onSearch = async () => {
    const keyword = form.value.keyword?.trim();
    if (!keyword) {
        arcoMessage("warning", "请输入搜索关键词");
        return;
    }
    searchLoading.value = true;
    searchMode.value = true;
    try {
        const res = await searchAreaAPI(keyword);
        searchResults.value = res.data.list || [];
        if (searchResults.value.length === 0) {
            arcoMessage("info", "未找到匹配的地区");
        }
    } catch (error) {
        console.error("搜索失败:", error);
        arcoMessage("error", "搜索失败");
        searchResults.value = [];
    }
    searchLoading.value = false;
};

const onResetSearch = () => {
    searchMode.value = false;
    form.value.keyword = "";
    searchResults.value = [];
};

// ===== 初始化数据 =====
const initLoading = ref(false);
const onInitData = async () => {
    initLoading.value = true;
    try {
        const res = await initAreaDataAPI();
        arcoMessage("success", res.message || "初始化成功");
        await refreshAreaData();
        treeSelectKey.value++;
        getRootList();
    } catch (error) {
        console.error("初始化失败:", error);
        arcoMessage("error", "初始化失败");
    }
    initLoading.value = false;
};

// ===== 弹窗 CRUD =====
const open = ref(false);
const formRef = ref();
const formType = ref(0); // 0新增 1修改 2新增下级
const title = ref("");
const treeSelectKey = ref(0);
const rules = {
    value: [{ required: true, message: "请输入地区编码" }],
    label: [{ required: true, message: "请输入地区名称" }]
};
const addFrom = ref<AreaFormData>({
    id: undefined,
    value: "",
    label: "",
    parent: "",
    sort: undefined
});

const onAdd = () => {
    title.value = "添加地区";
    formType.value = 0;
    open.value = true;
};

const onAddChild = (parentValue: string) => {
    title.value = "新增下级地区";
    formType.value = 2;
    addFrom.value.parent = parentValue;
    open.value = true;
};

const onUpdate = (row: AreaItem | AreaSearchItem) => {
    title.value = "修改地区";
    formType.value = 1;
    addFrom.value = {
        id: row.id,
        value: row.value,
        label: row.label,
        parent: row.parent,
        sort: row.sort
    };
    open.value = true;
};

const handleOk = async () => {
    const invalid = await formRef.value.validate();
    if (invalid) return false;
    try {
        if (formType.value === 1) {
            await updateAreaAPI(addFrom.value);
            arcoMessage("success", "修改成功");
            updateLocalNode(addFrom.value);
        } else {
            await addAreaAPI(addFrom.value);
            arcoMessage("success", "添加成功");
        }
    } catch (error) {
        console.error("操作失败:", error);
        arcoMessage("error", "操作失败");
        return false;
    }
    await refreshAreaData();
    treeSelectKey.value++;
    if (addFrom.value.parent) {
        await reloadChildren(addFrom.value.parent);
    } else {
        await getRootList();
    }
    return true;
};

const afterClose = () => {
    formRef.value?.resetFields();
    addFrom.value = {
        id: undefined,
        value: "",
        label: "",
        parent: "",
        sort: undefined
    };
};

// 本地更新节点（编辑后避免全量刷新丢失展开状态）
const updateLocalNode = (data: AreaFormData) => {
    if (!data.id) return;
    if (searchMode.value) {
        const idx = searchResults.value.findIndex((n) => n.id === data.id);
        if (idx > -1) {
            searchResults.value[idx].value = data.value || searchResults.value[idx].value;
            searchResults.value[idx].label = data.label;
        }
        return;
    }
    const node = findInTreeById(areaList.value, data.id);
    if (node) {
        node.label = data.label;
        if (data.value && data.value !== node.value) {
            node.value = data.value;
        }
    }
};

const findInTreeById = (list: AreaItem[], id: number): AreaItem | undefined => {
    for (const item of list) {
        if (item.id === id) return item;
        if (item.children) {
            const found = findInTreeById(item.children, id);
            if (found) return found;
        }
    }
    return undefined;
};

const findNodeByValue = (list: AreaItem[], value: string): AreaItem | undefined => {
    for (const item of list) {
        if (item.value === value) return item;
        if (item.children) {
            const found = findNodeByValue(item.children, value);
            if (found) return found;
        }
    }
    return undefined;
};

// 刷新指定父节点的子列表（新增下级后局部刷新，保持其他节点展开状态）
const reloadChildren = async (parentValue: string) => {
    try {
        const res = await getAreaChildrenAPI(parentValue);
        const parentNode = findNodeByValue(areaList.value, parentValue);
        if (parentNode) {
            parentNode.children = res.data.list || [];
        }
    } catch (error) {
        console.error("刷新子节点失败:", error);
    }
};

// ===== 删除 =====
const onDelete = async (record: AreaItem | AreaSearchItem) => {
    try {
        await deleteAreaAPI(record.value);
        arcoMessage("success", "删除成功");
        await refreshAreaData();
        treeSelectKey.value++;
        if (searchMode.value) {
            onSearch();
        } else {
            getRootList();
        }
    } catch (error) {
        console.error("删除失败:", error);
        arcoMessage("error", "删除失败");
    }
};

const deleteTip = (record: AreaItem | AreaSearchItem) => {
    const children = (record as AreaItem).children;
    if (children && children.length > 0) {
        return `该地区下存在 ${children.length} 个子级，删除将一并删除所有子级，确定删除吗?`;
    }
    return "确定删除该地区吗?";
};

// ===== 组件演示 =====
const demoVisible = ref(false);
const demoAreaValue = ref("");
const demoAreaValues = ref<string[]>([]);
const demoTreeValue = ref("");

const resetDemo = () => {
    demoAreaValue.value = "";
    demoAreaValues.value = [];
    demoTreeValue.value = "";
};

onMounted(() => {
    getRootList();
});
</script>

<style lang="scss" scoped></style>
