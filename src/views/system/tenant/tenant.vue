<template>
    <div class="snow-page">
        <a-card class="general-card">
            <a-row>
                <a-col :span="24">
                    <a-form :model="formModel" :layout="layoutMode.layout" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }"
                        label-align="left" auto-label-width>
                        <a-row :gutter="16">
                            <a-col :span="isMobile ? 24 : 6">
                                <a-form-item field="name" label="租户名称">
                                    <a-input v-model="formModel.name" placeholder="请输入租户名称" allow-clear />
                                </a-form-item>
                            </a-col>
                            <a-col :span="isMobile ? 24 : 6">
                                <a-form-item field="code" label="租户编码">
                                    <a-input v-model="formModel.code" placeholder="请输入租户编码" allow-clear />
                                </a-form-item>
                            </a-col>
                            <a-col :span="isMobile ? 24 : 6">
                                <a-form-item field="status" label="状态">
                                    <a-select v-model="formModel.status" placeholder="请选择状态" allow-clear>
                                        <a-option :value="1">启用</a-option>
                                        <a-option :value="0">停用</a-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :span="isMobile ? 24 : 6">
                                <a-space wrap>
                                    <a-button type="primary" @click="search">
                                        <template #icon>
                                            <icon-search />
                                        </template>
                                        查询
                                    </a-button>
                                    <a-button @click="reset">
                                        <template #icon>
                                            <icon-refresh />
                                        </template>
                                        重置
                                    </a-button>
                                    <a-button type="primary" @click="handleAdd" v-hasPerm="['system:tenant:add']">
                                        <template #icon>
                                            <icon-plus />
                                        </template>
                                        新增
                                    </a-button>
                                </a-space>

                            </a-col>
                        </a-row>
                    </a-form>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <a-table row-key="id" :loading="loading" :data="renderData" :pagination="pagination"
                        @page-change="pageChange" @page-size-change="pageSizeChange">
                        <template #columns>
                            <a-table-column title="ID" data-index="id" :width="70" align="center"></a-table-column>
                            <a-table-column title="租户名称" data-index="name" :ellipsis="true" tooltip
                                :width="150"></a-table-column>
                            <a-table-column title="租户编码" data-index="code" :width="150"></a-table-column>
                            <a-table-column title="描述" data-index="description" :ellipsis="true" tooltip :width="150">
                                <template #cell="{ record }">
                                    {{ record.description || '-' }}
                                </template>
                            </a-table-column>
                            <a-table-column title="域名" data-index="domain" :ellipsis="true" tooltip :width="150">
                                <template #cell="{ record }">
                                    {{ record.domain || '-' }}
                                </template>
                            </a-table-column>
                            <a-table-column title="状态" data-index="status" :width="70" align="center">
                                <template #cell="{ record }">
                                    <a-tag :color="record.status === 1 ? 'green' : 'red'">
                                        {{ record.status === 1 ? '启用' : '停用' }}
                                    </a-tag>
                                </template>
                            </a-table-column>
                            <a-table-column title="创建时间" data-index="createdAt" :width="180">
                                <template #cell="{ record }">
                                    {{ record.createdAt ? formatTime(record.createdAt) : "" }}
                                </template>
                            </a-table-column>
                            <a-table-column title="操作" :width="240" :fixed="isMobile ? '' : 'right'">
                                <template #cell="{ record }">
                                    <a-link type="text" size="small" @click="handleEdit(record)"
                                        v-hasPerm="['system:tenant:edit']">
                                        <template #icon><icon-edit /></template>
                                        修改
                                    </a-link>
                                    <a-link type="text" size="small" @click="handleAssignUser(record)"
                                        v-hasPerm="['system:tenant:assignUser']">
                                        <template #icon><icon-user /></template>
                                        分配用户
                                    </a-link>
                                    <a-popconfirm content="确定要删除该租户吗?" @ok="handleDelete(record)">
                                        <a-link type="text" size="small" status="danger"
                                            v-hasPerm="['system:tenant:delete']">
                                            <template #icon><icon-delete /></template>
                                            删除
                                        </a-link>
                                    </a-popconfirm>
                                </template>
                            </a-table-column>
                        </template>
                    </a-table>
                </a-col>
            </a-row>
        </a-card>

        <!-- 新增/编辑弹窗 -->
        <a-modal :width="layoutMode.width" v-model:visible="modalVisible" :title="modalTitle" @ok="handleOk" @cancel="handleCancel">
            <a-form ref="formRef" :layout="layoutMode.layout" :model="modalFormModel" :rules="rules">
                <a-form-item field="name" label="租户名称">
                    <a-input v-model="modalFormModel.name" placeholder="请输入租户名称" />
                </a-form-item>
                <a-form-item field="code" label="租户编码">
                    <a-input v-model="modalFormModel.code" placeholder="请输入租户编码" :disabled="isEdit" />
                </a-form-item>
                <a-form-item field="domain" label="绑定域名">
                    <a-input v-model="modalFormModel.domain" placeholder="请输入绑定域名" />
                </a-form-item>
                <a-form-item field="description" label="描述">
                    <a-textarea v-model="modalFormModel.description" placeholder="请输入描述" />
                </a-form-item>
                <a-form-item field="status" label="状态">
                    <a-radio-group v-model="modalFormModel.status">
                        <a-radio :value="1">启用</a-radio>
                        <a-radio :value="0">停用</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 用户分配弹窗 -->
        <s-tenant-user v-model:visible="userAssignVisible" :tenant-id="currentRecord?.id"
            :tenant-name="currentRecord?.name" @success="onUserAssignSuccess" />
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getTenantList, addTenant, updateTenant, deleteTenant, getTenantById, Tenant } from '@/api/tenant'
import { formatTime } from "@/globals";
// 引入用户分配组件
import STenantUser from "@/components/s-tenant-user/index.vue";

// 引入图标组件
import { IconUser } from '@arco-design/web-vue/es/icon';
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


const loading = ref(false)
const renderData = ref<Tenant[]>([])
const formModel = reactive({
    name: '',
    code: '',
    status: undefined as number | undefined
})

const modalVisible = ref(false)
const modalTitle = ref('')
const isEdit = ref(false)
const currentRecord = ref<Tenant | null>(null)

// 用户分配相关状态
const userAssignVisible = ref(false)

const modalFormModel = reactive({
    name: '',
    code: '',
    domain: '',
    description: '',
    status: 1
})

const rules = {
    name: [{ required: true, message: '请输入租户名称' }],
    code: [{ required: true, message: '请输入租户编码' }]
}

const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    showPageSize: true,
    showTotal: true
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            pageNum: pagination.current,
            pageSize: pagination.pageSize,
            order: "id desc",
            name: formModel.name || undefined,
            code: formModel.code || undefined,
            status: formModel.status
        }
        const res = await getTenantList(params)
        renderData.value = res.data.list
        pagination.total = res.data.total
    } catch (error) {
        Message.error('获取租户列表失败')
    } finally {
        loading.value = false
    }
}

const search = () => {
    pagination.current = 1
    fetchData()
}

const reset = () => {
    formModel.name = ''
    formModel.code = ''
    formModel.status = undefined
    pagination.current = 1
    fetchData()
}

const pageChange = (current: number) => {
    pagination.current = current
    fetchData()
}

const pageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.current = 1
    fetchData()
}

const handleAdd = () => {
    modalTitle.value = '新增租户'
    isEdit.value = false
    modalVisible.value = true
    // 重置表单
    modalFormModel.name = ''
    modalFormModel.code = ''
    modalFormModel.domain = ''
    modalFormModel.description = ''
    modalFormModel.status = 1
    currentRecord.value = null
}

const handleEdit = async (record: Tenant) => {
    modalTitle.value = '编辑租户'
    isEdit.value = true
    modalVisible.value = true
    currentRecord.value = record

    // 获取最新数据
    try {
        const res = await getTenantById(record.id)
        const data = res.data
        modalFormModel.name = data.name
        modalFormModel.code = data.code
        modalFormModel.domain = data.domain || ''
        modalFormModel.description = data.description || ''
        modalFormModel.status = data.status
    } catch (error) {
        Message.error('获取租户信息失败')
    }
}

// 分配用户
const handleAssignUser = (record: Tenant) => {
    currentRecord.value = record
    userAssignVisible.value = true
}

// 用户分配成功回调
const onUserAssignSuccess = () => {
}

const handleDelete = async (record: Tenant) => {
    try {
        await deleteTenant(record.id)
        Message.success('删除成功')
        fetchData()
    } catch (error) {
        Message.error('删除失败')
    }
}

const handleOk = async () => {
    try {
        if (isEdit.value) {
            // 编辑
            await updateTenant({
                id: currentRecord.value?.id,
                ...modalFormModel
            })
            Message.success('更新成功')
        } else {
            // 新增
            await addTenant(modalFormModel)
            Message.success('新增成功')
        }
        modalVisible.value = false
        fetchData()
    } catch (error: any) {
        Message.error(error.message || (isEdit.value ? '更新失败' : '新增失败'))
    }
}

const handleCancel = () => {
    modalVisible.value = false
}

onMounted(() => {
    fetchData()
})
</script>

<script lang="ts">
export default {
    name: 'Tenant'
}
</script>

<style scoped lang="scss">
.general-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>