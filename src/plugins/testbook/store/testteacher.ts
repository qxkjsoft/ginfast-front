import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TestTeacherData, TestTeacherListParams, TestTeacherListResult, TestTeacherResult } from '../api/testteacher';
import {
    getTestTeacherList,
    createTestTeacher,
    updateTestTeacher,
    deleteTestTeacher,
    getTestTeacher
} from '../api/testteacher';


export const useTestTeacherPluginStore = defineStore('testbook-testteacher-plugin', () => {
    // State
    const dataList = ref<TestTeacherData[]>([]);
    const loading = ref<boolean>(false);
    const total = ref<number>(0);
    const currentPage = ref<number>(1);
    const pageSize = ref<number>(10);
    const searchParams = ref<{
        tcId?: number; // 主键ID
        tcName?: string; // 教师姓名
        employeeId?: string; // 工号
        gender?: number; // 性别：0-未知 1-男 2-女
        phone?: string; // 手机号
        email?: string; // 邮箱
        subject?: string; // 所教学科
        title?: string; // 职称
        status?: number; // 状态：0-离职 1-在职
        hireDate?: string; // 入职日期
        birthDate?: string; // 出生日期
        createdAt?: string; // 创建时间
        updatedAt?: string; // 更新时间
        deletedAt?: string; // 删除时间
        createdBy?: number; // 创建人
    }>({});

    // Getters
    const getDataList = computed(() => dataList.value);
    const isLoading = computed(() => loading.value);
    const getTotal = computed(() => total.value);
    const getCurrentPage = computed(() => currentPage.value);
    const getPageSize = computed(() => pageSize.value);
    const getSearchParams = computed(() => searchParams.value);

    // Actions
    const fetchDataList = async (params?: Partial<TestTeacherListParams>) => {
        loading.value = true;
        try {
            // 更新分页参数
            if (params?.pageNum !== undefined) {
                currentPage.value = params.pageNum;
            }
            if (params?.pageSize !== undefined) {
                pageSize.value = params.pageSize;
            }
            if (params?.tcId !== undefined) {
                searchParams.value.tcId = params.tcId;
            }
            if (params?.tcName !== undefined) {
                searchParams.value.tcName = params.tcName;
            }
            if (params?.employeeId !== undefined) {
                searchParams.value.employeeId = params.employeeId;
            }
            if (params?.gender !== undefined) {
                searchParams.value.gender = params.gender;
            }
            if (params?.phone !== undefined) {
                searchParams.value.phone = params.phone;
            }
            if (params?.email !== undefined) {
                searchParams.value.email = params.email;
            }
            if (params?.subject !== undefined) {
                searchParams.value.subject = params.subject;
            }
            if (params?.title !== undefined) {
                searchParams.value.title = params.title;
            }
            if (params?.status !== undefined) {
                searchParams.value.status = params.status;
            }
            if (params?.hireDate !== undefined) {
                searchParams.value.hireDate = params.hireDate;
            }
            if (params?.birthDate !== undefined) {
                searchParams.value.birthDate = params.birthDate;
            }
            if (params?.createdAt !== undefined) {
                searchParams.value.createdAt = params.createdAt;
            }
            if (params?.updatedAt !== undefined) {
                searchParams.value.updatedAt = params.updatedAt;
            }
            if (params?.deletedAt !== undefined) {
                searchParams.value.deletedAt = params.deletedAt;
            }
            if (params?.createdBy !== undefined) {
                searchParams.value.createdBy = params.createdBy;
            }

            // 构造请求参数
            const requestParams: TestTeacherListParams = {
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                ...(searchParams.value.tcId ? { tcId: searchParams.value.tcId } : {}),
                ...(searchParams.value.tcName ? { tcName: searchParams.value.tcName } : {}),
                ...(searchParams.value.employeeId ? { employeeId: searchParams.value.employeeId } : {}),
                ...(searchParams.value.gender ? { gender: searchParams.value.gender } : {}),
                ...(searchParams.value.phone ? { phone: searchParams.value.phone } : {}),
                ...(searchParams.value.email ? { email: searchParams.value.email } : {}),
                ...(searchParams.value.subject ? { subject: searchParams.value.subject } : {}),
                ...(searchParams.value.title ? { title: searchParams.value.title } : {}),
                ...(searchParams.value.status ? { status: searchParams.value.status } : {}),
                ...(searchParams.value.hireDate ? { hireDate: searchParams.value.hireDate } : {}),
                ...(searchParams.value.birthDate ? { birthDate: searchParams.value.birthDate } : {}),
                ...(searchParams.value.createdAt ? { createdAt: searchParams.value.createdAt } : {}),
                ...(searchParams.value.updatedAt ? { updatedAt: searchParams.value.updatedAt } : {}),
                ...(searchParams.value.deletedAt ? { deletedAt: searchParams.value.deletedAt } : {}),
                ...(searchParams.value.createdBy ? { createdBy: searchParams.value.createdBy } : {}),
            };

            const response: TestTeacherListResult = await getTestTeacherList(requestParams);

            // 根据返回的数据结构处理
            if (Array.isArray(response.data.list)) {
                // 如果返回的是数组格式（旧格式）
                dataList.value = response.data.list || [];
                total.value = response.data.total || 0;
            }
        } finally {
            loading.value = false;
        }
    };

    const createData = async (data: Omit<TestTeacherData, 'tcId'>) => {
        try {
            const response = await createTestTeacher(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const updateData = async (data: Partial<TestTeacherData>) => {
        try {
            const response = await updateTestTeacher(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const deleteData = async (tcId: number) => {
        try {
            await deleteTestTeacher(tcId);
            dataList.value = dataList.value.filter((item: TestTeacherData) => item.tcId !== tcId);
            // 减少总数
            total.value = Math.max(0, total.value - 1);
        } catch (error) {
            throw error;
        }
    };

    // 根据ID获取用户详情
    const getDetail = async (tcId: number) : Promise<TestTeacherResult> => {
        try {
            const response = await getTestTeacher(tcId);
            return response;
        } catch (error) {
            throw error;
        }
    };
    
    // 重置搜索条件
    const resetSearchParams = () => {
        searchParams.value = {};
        currentPage.value = 1;
    };

    return {
        // State
        dataList,
        loading,
        total,
        currentPage,
        pageSize,
        searchParams,

        // Getters
        getDataList,
        isLoading,
        getTotal,
        getCurrentPage,
        getPageSize,
        getSearchParams,

        // Actions
        fetchDataList,
        createData,
        updateData,
        deleteData,
        resetSearchParams,
        getDetail
    };
});