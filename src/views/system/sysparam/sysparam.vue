<template>
    <div class="snow-page">
        <div class="snow-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.name" placeholder="请输入参数名称" allow-clear />
                        <a-input v-model="form.code" placeholder="请输入参数标识" allow-clear />
                        <a-select placeholder="启用状态" v-model="form.status" style="width: 120px" allow-clear>
                            <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name
                                }}</a-option>
                        </a-select>
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
                        <a-button type="primary" @click="onAdd" v-hasPerm="['system:param:add']">
                            <template #icon><icon-plus /></template>
                            <span>新增</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>

            <a-table row-key="id" :data="paramList" :bordered="{ cell: true }" :loading="loading"
                :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination">
                <template #columns>
                    <a-table-column title="ID" data-index="id" :width="70" align="center"></a-table-column>
                    <a-table-column title="参数名称" data-index="name" :width="150"></a-table-column>
                    <a-table-column title="参数标识" data-index="code" :width="180"></a-table-column>
                    <a-table-column title="参数值" data-index="value" :ellipsis="true" :width="200"
                        :tooltip="true"></a-table-column>
                    <a-table-column title="状态" :width="100" align="center">
                        <template #cell="{ record }">
                            <a-tag bordered size="small" color="arcoblue" v-if="record.status === 1">启用</a-tag>
                            <a-tag bordered size="small" color="red" v-else>禁用</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="描述" data-index="description" :ellipsis="true" :width="150"
                        :tooltip="true"></a-table-column>
                    <a-table-column title="创建时间" data-index="createdAt" :width="180">
                        <template #cell="{ record }">
                            {{ record.createdAt ? formatTime(record.createdAt) : '' }}
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="200" align="center" :fixed="isMobile ? '' : 'right'">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link @click="onUpdate(record)" v-hasPerm="['system:param:edit']">
                                    <template #icon><icon-edit /></template>
                                    <span>修改</span>
                                </a-link>
                                <a-popconfirm type="warning" content="确定删除该参数吗?" @ok="onDelete(record)">
                                    <a-link status="danger" v-hasPerm="['system:param:delete']">
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

        <a-modal :width="layoutMode.width" v-model:visible="open" @close="afterClose" :on-before-ok="handleOk"
            @cancel="afterClose">
            <template #title> {{ title }} </template>
            <div>
                <a-form ref="formRef" :layout="layoutMode.layout" auto-label-width :rules="rules" :model="addForm">
                    <a-form-item field="name" label="参数名称" validate-trigger="blur">
                        <a-input v-model="addForm.name" placeholder="请输入参数名称" allow-clear />
                    </a-form-item>
                    <a-form-item field="code" label="参数标识" validate-trigger="blur">
                        <a-input v-model="addForm.code" placeholder="请输入参数唯一标识" allow-clear />
                    </a-form-item>
                    <a-form-item field="value" label="参数值" validate-trigger="blur">
                        <a-textarea v-model="addForm.value" placeholder="请输入参数值" :auto-size="{ minRows: 3, maxRows: 6 }" allow-clear />
                    </a-form-item>
                    <a-form-item field="description" label="描述" validate-trigger="blur">
                        <a-textarea v-model="addForm.description" placeholder="请输入描述" allow-clear />
                    </a-form-item>
                    <a-form-item field="status" label="状态" validate-trigger="blur">
                        <a-switch type="round" :checked-value="1" :unchecked-value="0" v-model="addForm.status">
                            <template #checked> 启用 </template>
                            <template #unchecked> 禁用 </template>
                        </a-switch>
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { deepClone } from "@/utils";
import { formatTime } from "@/globals";
import {
    getParamListAPI,
    addParamAPI,
    updateParamAPI,
    deleteParamAPI,
    type SystemParam,
    type ParamListParams,
    type ParamAddParams,
    type ParamUpdateParams
} from "@/api/sysparam";

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

const openState = ref(dictFilter("status"));
const form = ref<ParamListParams>({
    name: "",
    code: "",
    status: undefined
});

const search = () => {
    getParamList();
};
const reset = () => {
    form.value = {
        name: "",
        code: "",
        status: undefined
    };
    currentPage.value = 1;
    getParamList();
};

const open = ref<boolean>(false);
const title = ref<string>("");
const rules = {
    name: [
        {
            required: true,
            message: "请输入参数名称"
        }
    ],
    code: [
        {
            required: true,
            message: "请输入参数唯一标识"
        }
    ],
    status: [
        {
            required: true,
            message: "请选择状态"
        }
    ]
};
const addForm = ref<ParamAddParams & { id?: number }>({
    name: "",
    code: "",
    value: "",
    status: 1,
    description: ""
});
const formRef = ref();

const onAdd = () => {
    open.value = true;
    title.value = "新增参数";
};

const handleOk = async () => {
    let state = await formRef.value.validate();
    if (state) return false;

    try {
        if (addForm.value.id) {
            const updateData: ParamUpdateParams = {
                id: addForm.value.id,
                name: addForm.value.name,
                code: addForm.value.code,
                value: addForm.value.value,
                status: addForm.value.status,
                description: addForm.value.description
            };
            await updateParamAPI(updateData);
            arcoMessage("success", "修改参数成功");
        } else {
            const addData: ParamAddParams = {
                name: addForm.value.name,
                code: addForm.value.code,
                value: addForm.value.value,
                status: addForm.value.status,
                description: addForm.value.description
            };
            await addParamAPI(addData);
            arcoMessage("success", "新增参数成功");
        }
        getParamList();
        return true;
    } catch (error) {
        console.error("操作失败:", error);
        return false;
    }
};

const afterClose = () => {
    formRef.value.resetFields();
    addForm.value = {
        name: "",
        code: "",
        value: "",
        status: 1,
        description: ""
    };
};

const onUpdate = (record: SystemParam) => {
    title.value = "修改参数";
    addForm.value = { ...deepClone(record) };
    open.value = true;
};

const onDelete = async (record: SystemParam) => {
    try {
        await deleteParamAPI({ id: record.id });
        arcoMessage("success", "删除成功");
        getParamList();
    } catch (error) {
        console.error("删除失败:", error);
        arcoMessage("error", "删除失败");
    }
};

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
        getParamList();
    },
    onPageSizeChange: (size: number) => {
        pageSize.value = size;
        currentPage.value = 1;
        getParamList();
    }
});

const paramList = ref<SystemParam[]>([]);
const getParamList = async () => {
    loading.value = true;
    try {
        const params: ParamListParams = {
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            order: "id desc",
            ...form.value
        };
        const res = await getParamListAPI(params);
        if (res.data) {
            paramList.value = res.data.list || [];
            total.value = res.data.total || 0;
        }
    } catch (error) {
        console.error("获取参数列表失败:", error);
        arcoMessage("error", "获取参数列表失败");
    } finally {
        loading.value = false;
    }
};

getParamList();
</script>

<style lang="scss" scoped></style>
