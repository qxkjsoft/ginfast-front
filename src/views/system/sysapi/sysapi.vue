<template>
    <div class="snow-page">
        <div class="snow-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.title" placeholder="请输入API标题" allow-clear />
                        <a-input v-model="form.path" placeholder="请输入API路径" allow-clear />
                        <a-select v-model="form.method" placeholder="请选择请求方法" allow-clear style="width: 120px">
                            <a-option v-for="item in methodOptions" :key="item.value" :value="item.value">{{ item.name
                                }}</a-option>
                        </a-select>
                        <a-input v-model="form.apiGroup" placeholder="请输入API分组" allow-clear />
                        <a-button type="primary" @click="onSearch">
                            <template #icon><icon-search /></template>
                            <span>查询</span>
                        </a-button>
                        <a-button @click="onReset">
                            <template #icon><icon-refresh /></template>
                            <span>重置</span>
                        </a-button>
                    </a-space>
                </template>
                <template #right>
                    <a-space wrap>
                        <a-button type="primary" @click="onAdd" v-hasPerm="['system:api:add']">
                            <template #icon><icon-plus /></template>
                            <span>新增</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>
            <a-table row-key="id" :data="tableData" :bordered="{ cell: true }" :loading="loading"
                :pagination="pagination" @page-change="onPageChange" @page-size-change="onPageSizeChange"
                :scroll="{ x: '100%', y: '100%', minWidth: 1000 }">
                <template #columns>
                    <a-table-column title="ID" data-index="id" :width="80"></a-table-column>
                    <a-table-column title="API标题" data-index="title"></a-table-column>
                    <a-table-column title="API路径" data-index="path"></a-table-column>
                    <a-table-column title="请求方法" :width="100" align="center">
                        <template #cell="{ record }">
                            <a-tag :color="getMethodColor(record.method)">{{ record.method }}</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="API分组" data-index="apiGroup"></a-table-column>
                    <a-table-column title="创建时间" data-index="createdAt" :width="180">
                        <template #cell="{ record }">{{ record.createdAt ? formatTime(record.createdAt) : ""
                            }}</template>
                    </a-table-column>
                    <a-table-column title="操作" :width="200" align="center" :fixed="'right'">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link @click="onUpdate(record)" v-hasPerm="['system:api:edit']">
                                    <template #icon><icon-edit /></template>
                                    <span>修改</span>
                                </a-link>
                                <a-popconfirm type="warning" content="确定删除该项吗?" @ok="onDelete(record)">
                                    <a-link status="danger" v-hasPerm="['system:api:delete']">
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

        <a-modal width="40%" v-model:visible="open" @close="afterClose" :on-before-ok="handleOk" @cancel="afterClose">
            <template #title> {{ title }} </template>
            <div>
                <a-form ref="formRef" auto-label-width :rules="rules" :model="addFrom">
                    <a-form-item field="title" label="API标题" validate-trigger="blur">
                        <a-input v-model="addFrom.title" placeholder="请输入API标题" allow-clear />
                    </a-form-item>
                    <a-form-item field="path" label="API路径" validate-trigger="blur">
                        <a-input v-model="addFrom.path" placeholder="请输入API路径" allow-clear />
                    </a-form-item>
                    <a-form-item field="method" label="请求方法" validate-trigger="blur">
                        <a-select v-model="addFrom.method" placeholder="请选择请求方法" allow-clear>
                            <a-option v-for="item in methodOptions" :key="item.value" :value="item.value">{{ item.name
                                }}</a-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item field="apiGroup" label="API分组" validate-trigger="blur">
                        <a-input v-model="addFrom.apiGroup" placeholder="请输入API分组" allow-clear />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import {
    getSysApiListAPI,
    getSysApiByIdAPI,
    addSysApiAPI,
    updateSysApiAPI,
    deleteSysApiAPI,
    type SysApiItem,
    type SysApiListParams,
    type SysApiAddParams,
    type SysApiUpdateParams,
    type SysApiDeleteParams
} from "@/api/sysapi";
import { Message } from "@arco-design/web-vue";
import { formatTime } from "@/globals";
// 查询表单
const form = ref<SysApiListParams>({
    title: "",
    path: "",
    method: "",
    apiGroup: ""
});

// 请求方法选项
const methodOptions = ref([
    { name: "GET", value: "GET" },
    { name: "POST", value: "POST" },
    { name: "PUT", value: "PUT" },
    { name: "DELETE", value: "DELETE" },
    { name: "PATCH", value: "PATCH" }
]);

// 获取请求方法对应的颜色
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

// 重置查询
const onReset = () => {
    form.value = {
        title: "",
        path: "",
        method: "",
        apiGroup: ""
    };
    pagination.current = 1;
    getSysApiList();
};

// 查询
const onSearch = () => {
    pagination.current = 1;
    getSysApiList();
};

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true
});

// 页码变化
const onPageChange = (current: number) => {
    pagination.current = current;
    getSysApiList();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    getSysApiList();
};

// 表格数据
const loading = ref(false);
const tableData = ref<SysApiItem[]>([]);

// 获取API列表
const getSysApiList = async () => {
    try {
        loading.value = true;
        const params = {
            pageNum: pagination.current,
            pageSize: pagination.pageSize,
            ...form.value
        };
        const { data } = await getSysApiListAPI(params);
        tableData.value = data.list;
        pagination.total = data.total;
    } finally {
        loading.value = false;
    }
};

// 新增/编辑弹窗
const open = ref(false);
const title = ref("");
const formType = ref(0); // 0新增 1编辑
const formRef = ref();
const rules = {
    title: [{ required: true, message: "请输入API标题" }],
    path: [{ required: true, message: "请输入API路径" }],
    method: [{ required: true, message: "请选择请求方法" }],
    apiGroup: [{ required: true, message: "请输入API分组" }]
};

// 表单数据
const addFrom = ref<SysApiAddParams | SysApiUpdateParams>({
    title: "",
    path: "",
    method: "",
    apiGroup: ""
});

// 新增
const onAdd = () => {
    title.value = "新增API";
    formType.value = 0;
    addFrom.value = {
        title: "",
        path: "",
        method: "",
        apiGroup: ""
    };
    open.value = true;
};

// 编辑
const onUpdate = async (row: SysApiItem) => {
    title.value = "编辑API";
    formType.value = 1;
    try {
        const { data } = await getSysApiByIdAPI(row.id);
        addFrom.value = {
            id: data.id,
            title: data.title,
            path: data.path,
            method: data.method,
            apiGroup: data.apiGroup
        };
        open.value = true;
    } catch (error) {
        console.error("获取API详情失败", error);
        Message.error("获取API详情失败");
    }
};

// 提交表单
const handleOk = async () => {
    const validate = await formRef.value.validate();
    if (validate) {
        return false;
    }

    try {
        if (formType.value === 0) {
            // 新增
            await addSysApiAPI(addFrom.value as SysApiAddParams);
            Message.success("新增成功");
        } else {
            // 编辑
            await updateSysApiAPI(addFrom.value as SysApiUpdateParams);
            Message.success("编辑成功");
        }
        getSysApiList();
        return true;
    } catch (error) {
        console.error("操作失败", error);
        Message.error("操作失败");
        return false;
    }
};

// 关闭弹窗后重置表单
const afterClose = () => {
    formRef.value?.resetFields();
    addFrom.value = {
        title: "",
        path: "",
        method: "",
        apiGroup: ""
    };
};

// 删除
const onDelete = async (row: SysApiItem) => {
    try {
        await deleteSysApiAPI({ id: row.id } as SysApiDeleteParams);
        Message.success("删除成功");
        getSysApiList();
    } catch (error) {
        console.error("删除失败", error);
        Message.error("删除失败");
    }
};

// 初始化
onMounted(() => {
    getSysApiList();
});
</script>

<style lang="scss" scoped></style>
