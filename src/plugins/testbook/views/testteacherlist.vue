<template>
    <div class="snow-fill">
        <a-card :loading="loading">
                <a-space wrap>
                    <!-- 查询表单-->
                    <!-- 主键ID精确查询 -->
                    <a-input-number v-model="searchForm.tcId" placeholder="请输入主键ID" style="width: 240px;" />
                    <!-- 教师姓名模糊查询（仅非数值类型支持） -->
                    <a-input-search v-model="searchForm.tcName" placeholder="请输入教师姓名搜索" style="width: 240px;" @search="handleSearch" allow-clear />
                    <!-- 工号精确查询 -->
                    <a-input v-model="searchForm.employeeId" placeholder="请输入工号" style="width: 240px;" />
                    <!-- 性别：0-未知 1-男 2-女选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.gender" placeholder="请选择性别：0-未知 1-男 2-女" style="width: 240px;" :options="genderOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <!-- 手机号精确查询 -->
                    <a-input v-model="searchForm.phone" placeholder="请输入手机号" style="width: 240px;" />
                    <!-- 邮箱精确查询 -->
                    <a-input v-model="searchForm.email" placeholder="请输入邮箱" style="width: 240px;" />
                    <!-- 所教学科精确查询 -->
                    <a-input v-model="searchForm.subject" placeholder="请输入所教学科" style="width: 240px;" />
                    <!-- 职称精确查询 -->
                    <a-input v-model="searchForm.title" placeholder="请输入职称" style="width: 240px;" />
                    <!-- 状态：0-离职 1-在职选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.status" placeholder="请选择状态：0-离职 1-在职" style="width: 240px;" :options="statusOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <!-- 入职日期范围查询（日期类型专用） -->
                    <a-range-picker v-model="searchForm.hireDateRange" style="width: 240px;" @change="handleSearch" />
                    <!-- 出生日期选择框查询（radio/select/checkbox统一使用select） -->
                    <a-select v-model="searchForm.birthDate" placeholder="请选择出生日期" style="width: 240px;" :options="birthDateOption" allow-clear>
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                    <a-button type="primary" @click="handleCreate" v-hasPerm="['plugins:testbooktestteacher:add']">
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
                    <a-table-column title="主键ID" data-index="tcId"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="教师姓名" data-index="tcName"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="工号" data-index="employeeId"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="性别：0-未知 1-男 2-女" data-index="gender"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="手机号" data-index="phone"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="邮箱" data-index="email"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="所教学科" data-index="subject"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="职称" data-index="title"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="状态：0-离职 1-在职" data-index="status"  :width="150"  ellipsis tooltip/>
                    <a-table-column title="入职日期" data-index="hireDate"  :width="150"  ellipsis tooltip>
                        <template #cell="{ record }">
                            {{ record['hireDate'] ? formatTime(record['hireDate']) : "" }}
                        </template>
                    </a-table-column>
                    <a-table-column title="出生日期" data-index="birthDate"  :width="150"  ellipsis tooltip>
                        <template #cell="{ record }">
                            {{ record['birthDate'] ? formatTime(record['birthDate']) : "" }}
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="200">
                        <template #cell="{ record }">
                            <a-space>
                                <a-button size="small" @click="handleEdit(record)" v-hasPerm="['plugins:testbooktestteacher:edit']">
                                    编辑
                                </a-button>
                                <a-popconfirm content="确定要删除这条数据吗？" @ok="handleDelete(record.tcId)">
                                    <a-button size="small" status="danger" v-hasPerm="['plugins:testbooktestteacher:delete']">
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
        <a-modal v-model:visible="modalVisible" :title="editingData.tcId ? '编辑数据' : '新增数据'" :on-before-ok="handleSave"
            @cancel="handleCancel">
            <a-form :model="editingData" :rules="rules" ref="formRef">
                <a-form-item field="tcName" label="教师姓名"><a-input v-model="editingData.tcName" placeholder="请输入教师姓名" />
                </a-form-item>
                <a-form-item field="employeeId" label="工号"><a-input v-model="editingData.employeeId" placeholder="请输入工号" />
                </a-form-item>
                <a-form-item field="gender" label="性别：0-未知 1-男 2-女">
                    <a-select v-model="editingData.gender" placeholder="请选择性别：0-未知 1-男 2-女" :options="genderOption">
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                </a-form-item>
                <a-form-item field="phone" label="手机号"><a-input v-model="editingData.phone" placeholder="请输入手机号" />
                </a-form-item>
                <a-form-item field="email" label="邮箱"><a-input v-model="editingData.email" placeholder="请输入邮箱" />
                </a-form-item>
                <a-form-item field="subject" label="所教学科"><a-input v-model="editingData.subject" placeholder="请输入所教学科" />
                </a-form-item>
                <a-form-item field="title" label="职称"><a-input v-model="editingData.title" placeholder="请输入职称" />
                </a-form-item>
                <a-form-item field="status" label="状态：0-离职 1-在职">
                    <a-select v-model="editingData.status" placeholder="请选择状态：0-离职 1-在职" :options="statusOption">
                        <template #label="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                        <template #option="{ data }">
                            <div>{{ data.name }}</div>
                        </template>
                    </a-select>
                </a-form-item>
                <a-form-item field="hireDate" label="入职日期"><a-date-picker value-format="YYYY-MM-DDTHH:mm:ss[Z]" v-model="editingData.hireDate" placeholder="请选择入职日期" />
                </a-form-item>
                <a-form-item field="birthDate" label="出生日期">
                    <a-select v-model="editingData.birthDate" placeholder="请选择出生日期" :options="birthDateOption">
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
import { useTestTeacherPluginStore } from '../store/testteacher';
import type { TestTeacherData } from '../api/testteacher';
import { storeToRefs } from 'pinia';
import { formatTime } from '@/globals';
const genderOption = ref(dictFilter("gender"));
const statusOption = ref(dictFilter("status"));
const birthDateOption = ref(dictFilter("testStart"));
const testTeacherStore = useTestTeacherPluginStore();
const {
    fetchDataList,
    createData,
    updateData,
    deleteData,
    getDetail,
    resetSearchParams
} = testTeacherStore;
const { dataList, loading, total, currentPage, pageSize } = storeToRefs(testTeacherStore);

const modalVisible = ref(false);
const formRef = ref();

// 搜索表单
const searchForm = reactive({
    tcId: undefined,
    tcName: '',
    employeeId: '',
    gender: undefined,
    phone: '',
    email: '',
    subject: '',
    title: '',
    status: undefined,
    hireDateRange: [],
    birthDate: '',
});

const editingData = reactive<Partial<TestTeacherData>>({
    tcId: undefined,
    tcName: undefined,
    employeeId: undefined,
    gender: undefined,
    phone: undefined,
    email: undefined,
    subject: undefined,
    title: undefined,
    status: undefined,
    hireDate: undefined,
    birthDate: undefined,
});

const rules = {
    tcName: [{ required: true, message: '教师姓名不能为空' }],
    employeeId: [{ required: true, message: '工号不能为空' }],
    gender: [{ required: true, message: '性别：0-未知 1-男 2-女不能为空' }],
    phone: [{ required: true, message: '手机号不能为空' }],
    email: [{ required: true, message: '邮箱不能为空' }],
    subject: [{ required: true, message: '所教学科不能为空' }],
    title: [{ required: true, message: '职称不能为空' }],
    status: [{ required: true, message: '状态：0-离职 1-在职不能为空' }],
    hireDate: [{ required: true, message: '入职日期不能为空' }],
    birthDate: [{ required: true, message: '出生日期不能为空' }],
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
    if (searchForm.tcId) {
        params.tcId = searchForm.tcId;
    }
    if (searchForm.tcName) {
        params.tcName = searchForm.tcName;
    }
    if (searchForm.employeeId) {
        params.employeeId = searchForm.employeeId;
    }
    if (searchForm.gender) {
        params.gender = searchForm.gender;
    }
    if (searchForm.phone) {
        params.phone = searchForm.phone;
    }
    if (searchForm.email) {
        params.email = searchForm.email;
    }
    if (searchForm.subject) {
        params.subject = searchForm.subject;
    }
    if (searchForm.title) {
        params.title = searchForm.title;
    }
    if (searchForm.status) {
        params.status = searchForm.status;
    }
    if (searchForm.hireDateRange && searchForm.hireDateRange.length === 2) {
        params.hireDate = searchForm.hireDateRange;
    }
    if (searchForm.birthDate) {
        params.birthDate = searchForm.birthDate;
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
    searchForm.tcId = undefined;
    searchForm.tcName = '';
    searchForm.employeeId = '';
    searchForm.gender = undefined;
    searchForm.phone = '';
    searchForm.email = '';
    searchForm.subject = '';
    searchForm.title = '';
    searchForm.status = undefined;
    searchForm.hireDateRange = [];
    searchForm.birthDate = '';
    resetSearchParams();
    loadData(1);
};

// 新增数据
const handleCreate = () => {
    // 重置表单数据
    Object.assign(editingData, {
        tcId: undefined,
        tcName: undefined,
        employeeId: undefined,
        gender: undefined,
        phone: undefined,
        email: undefined,
        subject: undefined,
        title: undefined,
        status: undefined,
        hireDate: undefined,
        birthDate: undefined,
    });
    modalVisible.value = true;
};

// 编辑数据
const handleEdit = async (record: TestTeacherData) => {
    // 获取详情
    const detail = await getDetail(record.tcId);
    // 赋值给编辑数据
    Object.assign(editingData, detail.data);
    modalVisible.value = true;
};

// 删除数据
const handleDelete = async (tcId: number) => {
    try {
        await deleteData(tcId);
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
        if (editingData.tcId) {
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