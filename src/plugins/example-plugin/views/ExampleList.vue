<template>
    <div class="example-plugin-container">
        <a-card title="示例插件列表" :loading="loading">
            <template #extra>
                <a-button type="primary" @click="handleCreate">
                    <template #icon>
                        <icon-plus />
                    </template>
                    <span>新增数据</span>
                </a-button>
            </template>

            <a-table :data="dataList" :loading="loading" :pagination="false" :bordered="{ wrapper: true, cell: true }">
                <a-table-column title="ID" data-index="id" />
                <a-table-column title="名称" data-index="name" />
                <a-table-column title="描述" data-index="description" />
                <a-table-column title="操作" :width="200">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button size="small" @click="handleEdit(record)">
                                编辑
                            </a-button>
                            <a-popconfirm content="确定要删除这条数据吗？" @ok="handleDelete(record.id)">
                                <a-button size="small" status="danger">
                                    删除
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </a-table-column>
            </a-table>
        </a-card>

        <!-- 编辑/创建弹窗 -->
        <a-modal v-model:visible="modalVisible" :title="editingData.id ? '编辑数据' : '新增数据'" @ok="handleSave"
            @cancel="handleCancel">
            <a-form :model="editingData" ref="formRef">
                <a-form-item field="name" label="名称" :rules="[{ required: true, message: '请输入名称' }]">
                    <a-input v-model="editingData.name" placeholder="请输入名称" />
                </a-form-item>
                <a-form-item field="description" label="描述" :rules="[{ required: true, message: '请输入描述' }]">
                    <a-textarea v-model="editingData.description" placeholder="请输入描述" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useExamplePluginStore } from '../store';
import type { ExampleData } from '../api';

const exampleStore = useExamplePluginStore();
const { dataList, loading, fetchDataList, createData, updateData, deleteData } = exampleStore;

const modalVisible = ref(false);
const formRef = ref();
const editingData = reactive({
    id: 0,
    name: '',
    description: '',
});

// 获取数据列表
const loadData = async () => {
    await fetchDataList();
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
    if (!isValid) return;

    try {
        if (editingData.id) {
            // 更新数据
            await updateData(editingData.id, editingData);
        } else {
            // 创建数据
            await createData(editingData);
        }

        // 关闭弹窗
        modalVisible.value = false;

        // 重新加载数据
        await loadData();
    } catch (error) {
        console.error('保存失败:', error);
    }
};

// 取消操作
const handleCancel = () => {
    modalVisible.value = false;
};

// 初始化加载数据
loadData();
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