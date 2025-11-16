<template>
    <div class="snow-fill">
        <a-card :loading="loading">
                <a-space wrap>
                    <!-- 查询表单-->
                    <!-- ID精确查询 -->
                    <a-input-number v-model="searchForm.stuId" placeholder="请输入ID" style="width: 240px;" />
                    <!-- 姓名模糊查询（仅非数值类型支持） -->
                    <a-input-search v-model="searchForm.stuName" placeholder="请输入姓名搜索" style="width: 240px;" @search="handleSearch" allow-clear />
                    <!-- 年龄数值类型不支持模糊查询，使用精确查询 -->
                    <a-input-number v-model="searchForm.age" placeholder="请输入年龄" style="width: 240px;" @change="handleSearch" />
                    <!-- 性别选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.gender" placeholder="请选择性别" style="width: 240px;" :options="genderOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <!--  邮箱选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.email" placeholder="请选择 邮箱" style="width: 240px;" :options="emailOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <!-- 地址选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.address" placeholder="请选择地址" style="width: 240px;" :options="addressOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <!-- 创建时间范围查询（日期类型专用） -->
                    <a-range-picker v-model="searchForm.createdAtRange" style="width: 240px;" @change="handleSearch" />
                    <!-- 租户ID字段精确查询 -->
                    <a-input-number v-model="searchForm.tenantId" placeholder="请输入租户ID字段" style="width: 240px;" />
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                    <a-button type="primary" @click="handleCreate" v-hasPerm="['plugins:testbookteststudents:add']">
                        <template #icon>
                            <icon-plus />
                        </template>
                        <span>新增数据</span>
                    </a-button>
                </a-space>

            <a-table :data="dataList" :loading="loading" :pagination="paginationConfig"
                :bordered="{ wrapper: true, cell: true }" @page-change="handlePageChange"
                @page-size-change="handlePageSizeChange">
                <template #columns>
                    <a-table-column title="姓名" data-index="stuName"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="年龄" data-index="age"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="性别" data-index="gender"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="班级名称" data-index="className"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="操作" :width="200">
                        <template #cell="{ record }">
                            <a-space>
                                <a-button size="small" @click="handleEdit(record)" v-hasPerm="['plugins:testbookteststudents:edit']">
                                    编辑
                                </a-button>
                                <a-popconfirm content="确定要删除这条数据吗？" @ok="handleDelete(record.stuId)">
                                    <a-button size="small" status="danger" v-hasPerm="['plugins:testbookteststudents:delete']">
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
        <a-modal v-model:visible="modalVisible" :title="editingData.stuId ? '编辑数据' : '新增数据'" :on-before-ok="handleSave"
            @cancel="handleCancel">
            <a-form :model="editingData" :rules="rules" ref="formRef">
                <a-form-item field="stuName" label="姓名"><a-textarea v-model="editingData.stuName" placeholder="请输入姓名" />
                </a-form-item>
                <a-form-item field="age" label="年龄"><a-input-number v-model="editingData.age" placeholder="请输入年龄" />
                </a-form-item>
                <a-form-item field="gender" label="性别"><a-radio-group v-model="editingData.gender" :options="genderOption"><template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-radio-group>
                </a-form-item>
                <a-form-item field="className" label="班级名称"><a-checkbox-group 
                        :modelValue="editingData.className ? JSON.parse(editingData.className) : []"
                        @update:modelValue="(val: any) => editingData.className = val.length > 0 ? JSON.stringify(val) : undefined" :options="classNameOption"><template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-checkbox-group>
                </a-form-item>
                <a-form-item field="admissionDate" label="入学日期"><a-date-picker value-format="YYYY-MM-DDTHH:mm:ss[Z]" v-model="editingData.admissionDate" placeholder="请选择入学日期" />
                </a-form-item>
                <a-form-item field="email" label=" 邮箱"><a-checkbox-group 
                        :modelValue="editingData.email ? JSON.parse(editingData.email) : []"
                        @update:modelValue="(val: any) => editingData.email = val.length > 0 ? JSON.stringify(val) : undefined" :options="emailOption"><template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-checkbox-group>
                </a-form-item>
                <a-form-item field="address" label="地址">
                    <a-select v-model="editingData.address" placeholder="请选择地址" :options="addressOption">
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useTestStudentsPluginStore } from '../store/teststudents';
import type { TestStudentsData } from '../api/teststudents';
import { storeToRefs } from 'pinia';
import { formatTime } from '@/globals';
const genderOption = ref(dictFilter("gender"));
const classNameOption = ref(dictFilter("class"));
const emailOption = ref(dictFilter("status"));
const addressOption = ref(dictFilter("status"));
const testStudentsStore = useTestStudentsPluginStore();
const {
    fetchDataList,
    createData,
    updateData,
    deleteData,
    getDetail,
    resetSearchParams
} = testStudentsStore;
const { dataList, loading, total, currentPage, pageSize } = storeToRefs(testStudentsStore);

const modalVisible = ref(false);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
    stuId: undefined,
    stuName: '',
    age: undefined,
    gender: '',
    email: '',
    address: '',
    createdAtRange: [],
    tenantId: undefined,
});

const editingData = reactive<Partial<TestStudentsData>>({
    stuId: undefined,
    stuName: undefined,
    age: undefined,
    gender: undefined,
    className: undefined,
    admissionDate: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
});

const rules = {
    stuName: [{ required: true, message: '姓名不能为空' }],
    age: [{ required: true, message: '年龄不能为空' }],
    gender: [{ required: true, message: '性别不能为空' }],
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
    const params: any = {
        pageNum,
        pageSize: pageSizeVal,
    };
    if (searchForm.stuId) {
        params.stuId = searchForm.stuId;
    }
    if (searchForm.stuName) {
        params.stuName = searchForm.stuName;
    }
    if (searchForm.age) {
        params.age = searchForm.age;
    }
    if (searchForm.gender) {
        params.gender = searchForm.gender;
    }
    if (searchForm.email) {
        params.email = searchForm.email;
    }
    if (searchForm.address) {
        params.address = searchForm.address;
    }
    if (searchForm.createdAtRange && searchForm.createdAtRange.length === 2) {
        params.createdAt = searchForm.createdAtRange;
    }
    if (searchForm.tenantId) {
        params.tenantId = searchForm.tenantId;
    }
    await fetchDataList(params);
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
    searchForm.stuId = undefined;
    searchForm.stuName = '';
    searchForm.age = undefined;
    searchForm.gender = '';
    searchForm.email = '';
    searchForm.address = '';
    searchForm.createdAtRange = [];
    searchForm.tenantId = undefined;
    resetSearchParams();
    loadData(1);
};

// 新增数据
const handleCreate = () => {
    // 重置表单数据
    Object.assign(editingData, {
        stuId: undefined,
        stuName: undefined,
        age: undefined,
        gender: undefined,
        className: undefined,
        admissionDate: undefined,
        email: undefined,
        phone: undefined,
        address: undefined,
    });
    modalVisible.value = true;
};

// 编辑数据
const handleEdit = async (record: TestStudentsData) => {
    // 获取详情
    const detail = await getDetail(record.stuId);
    // 赋值给编辑数据
    Object.assign(editingData, detail.data);
    modalVisible.value = true;
};

// 删除数据
const handleDelete = async (stuId: number) => {
    try {
        await deleteData(stuId);
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
    try {
        if (editingData.stuId) {
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

</style>