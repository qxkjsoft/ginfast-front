<template>
    <div class="example-plugin-container">
        <a-card title="示例插件列表" :loading="loading">
            <template #extra>
                <a-space>
                    <a-input-search v-model="searchForm.name" placeholder="请输入名称搜索" style="width: 240px;"
                        @search="handleSearch" allow-clear />

                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                    <a-button type="primary" @click="handleCreate" v-hasPerm="['plugins:example:add']">
                        <template #icon>
                            <icon-plus />
                        </template>
                        <span>新增数据</span>
                    </a-button>
                </a-space>
            </template>

            <a-table :data="dataList" :loading="loading" :pagination="paginationConfig"
                :bordered="{ wrapper: true, cell: true }" @page-change="handlePageChange"
                @page-size-change="handlePageSizeChange">
                <template #columns>
                    <a-table-column title="ID" data-index="id" :width="70" align="center" />
                    <a-table-column title="名称" data-index="name"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="描述" data-index="description"  :width="200"  ellipsis tooltip  />
                    <a-table-column title="操作" :width="200">
                        <template #cell="{ record }">
                            <a-space>
                                <a-button size="small" @click="handleEdit(record)" v-hasPerm="['plugins:example:edit']">
                                    编辑
                                </a-button>
                                <a-popconfirm content="确定要删除这条数据吗？" @ok="handleDelete(record.id)">
                                    <a-button size="small" status="danger" v-hasPerm="['plugins:example:delete']">
                                        删除
                                    </a-button>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table-column>
                </template>
            </a-table>

        </a-card>

        <!-- 编辑/创建弹窗 -->
        <a-modal v-model:visible="modalVisible" :title="editingData.id ? '编辑数据' : '新增数据'" :on-before-ok="handleSave"
            @cancel="handleCancel">
            <a-form :model="editingData" :rules="rules" ref="formRef">
                <a-form-item field="name" label="名称">
                    <a-input v-model="editingData.name" placeholder="请输入名称" />
                </a-form-item>
                <a-form-item field="description" label="描述">
                    <a-textarea v-model="editingData.description" placeholder="请输入描述" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useExamplePluginStore } from '../store/example';
import type { ExampleData } from '../api/example';
import { storeToRefs } from 'pinia';
const exampleStore = useExamplePluginStore();
const {
    fetchDataList,
    createData,
    updateData,
    deleteData,
    resetSearchParams
} = exampleStore;
const { dataList, loading, total, currentPage, pageSize } = storeToRefs(exampleStore);


const modalVisible = ref(false);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
    name: '',
});

const editingData = reactive({
    id: 0,
    name: '',
    description: '',
});

const rules = {
    name: [{ required: true, message: '请输入名称' }],
    description: [{ required: true, message: '请输入描述' }],
};

// 分页配置
const paginationConfig = computed(() => ({
    total: total.value,
    current: currentPage.value,
    pageSize: pageSize.value,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 30, 50],
}));

// 获取数据列表
const loadData = async (pageNum: number = currentPage.value, pageSizeVal: number = pageSize.value) => {
    await fetchDataList({
        pageNum,
        pageSize: pageSizeVal,
        name: searchForm.name || undefined
    });
};

// 处理分页变化
const handlePageChange = (page: number) => {
    loadData(page, pageSize.value);
};

// 处理页面大小变化
const handlePageSizeChange = (size: number) => {
    loadData(1, size); // 页码重置为1
};

// 搜索处理
const handleSearch = () => {
    loadData(1); // 搜索时重置到第一页
};

// 重置搜索
const handleReset = () => {
    searchForm.name = '';
    resetSearchParams();
    loadData(1);
};

// 新增数据
const handleCreate = () => {
    // 重置表单数据
    Object.assign(editingData, {
        id: 0,
        name: '',
        description: '',
    });
    modalVisible.value = true;
};

// 编辑数据
const handleEdit = (record: ExampleData) => {
    Object.assign(editingData, record);
    modalVisible.value = true;
};

// 删除数据
const handleDelete = async (id: number) => {
    try {
        await deleteData(id);
        // 重新加载当前页数据
        await loadData();
        // 显示删除成功消息
        // 这里可以使用项目的消息提示机制
    } catch (error) {
        // 显示删除失败消息
        console.error('删除失败:', error);
    }
};

// 保存数据
const handleSave = async () => {
    const isValid = await formRef.value?.validate();
    if (isValid) return false;
    console.log("editingData", editingData);
    try {
        if (editingData.id) {
            // 更新数据
            await updateData(editingData);
        } else {
            // 创建数据
            await createData(editingData);
        }
        // 重新加载数据
        await loadData();
    } catch (error) {
        console.error('保存失败:', error);
        return false;
    }
    return true;
};

// 取消操作
const handleCancel = () => {
    modalVisible.value = false;
};


onMounted(async () => {
    // 初始化加载数据
    await loadData();
})

</script>

<style scoped lang="scss">
.example-plugin-container {
    padding: 20px;

    :deep(.arco-card) {
        border-radius: 4px;
    }

    :deep(.arco-table-th) {
        background-color: var(--color-fill-2);
    }
}
</style>