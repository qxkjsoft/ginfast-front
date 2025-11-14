import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TestStudentsData, TestStudentsListParams, TestStudentsListResult, TestStudentsResult } from '../api/teststudents';
import {
    getTestStudentsList,
    createTestStudents,
    updateTestStudents,
    deleteTestStudents,
    getTestStudents
} from '../api/teststudents';


export const useTestStudentsPluginStore = defineStore('testbook-teststudents-plugin', () => {
    // State
    const dataList = ref<TestStudentsData[]>([]);
    const loading = ref<boolean>(false);
    const total = ref<number>(0);
    const currentPage = ref<number>(1);
    const pageSize = ref<number>(10);
    const searchParams = ref<{
        stuId?: number; // ID
        stuName?: string; // 姓名
        age?: number; // 年龄
        gender?: string; // 性别
        className?: string; // 班级名称
        admissionDate?: string; // 入学日期
        email?: string; //  邮箱
        phone?: string; // 电话号码
        address?: string; // 地址
        createdAt?: string; // 创建时间
        updatedAt?: string; // 更新时间
        deletedAt?: string; // 删除时间
        createdBy?: number; // 创建人
        tenantId?: number; // 租户ID字段
    }>({});

    // Getters
    const getDataList = computed(() => dataList.value);
    const isLoading = computed(() => loading.value);
    const getTotal = computed(() => total.value);
    const getCurrentPage = computed(() => currentPage.value);
    const getPageSize = computed(() => pageSize.value);
    const getSearchParams = computed(() => searchParams.value);

    // Actions
    const fetchDataList = async (params?: Partial<TestStudentsListParams>) => {
        loading.value = true;
        try {
            // 更新分页参数
            if (params?.pageNum !== undefined) {
                currentPage.value = params.pageNum;
            }
            if (params?.pageSize !== undefined) {
                pageSize.value = params.pageSize;
            }
            if (params?.stuId !== undefined) {
                searchParams.value.stuId = params.stuId;
            }
            if (params?.stuName !== undefined) {
                searchParams.value.stuName = params.stuName;
            }
            if (params?.age !== undefined) {
                searchParams.value.age = params.age;
            }
            if (params?.gender !== undefined) {
                searchParams.value.gender = params.gender;
            }
            if (params?.className !== undefined) {
                searchParams.value.className = params.className;
            }
            if (params?.admissionDate !== undefined) {
                searchParams.value.admissionDate = params.admissionDate;
            }
            if (params?.email !== undefined) {
                searchParams.value.email = params.email;
            }
            if (params?.phone !== undefined) {
                searchParams.value.phone = params.phone;
            }
            if (params?.address !== undefined) {
                searchParams.value.address = params.address;
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
            if (params?.tenantId !== undefined) {
                searchParams.value.tenantId = params.tenantId;
            }

            // 构造请求参数
            const requestParams: TestStudentsListParams = {
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                ...(searchParams.value.stuId ? { stuId: searchParams.value.stuId } : {}),
                ...(searchParams.value.stuName ? { stuName: searchParams.value.stuName } : {}),
                ...(searchParams.value.age ? { age: searchParams.value.age } : {}),
                ...(searchParams.value.gender ? { gender: searchParams.value.gender } : {}),
                ...(searchParams.value.className ? { className: searchParams.value.className } : {}),
                ...(searchParams.value.admissionDate ? { admissionDate: searchParams.value.admissionDate } : {}),
                ...(searchParams.value.email ? { email: searchParams.value.email } : {}),
                ...(searchParams.value.phone ? { phone: searchParams.value.phone } : {}),
                ...(searchParams.value.address ? { address: searchParams.value.address } : {}),
                ...(searchParams.value.createdAt ? { createdAt: searchParams.value.createdAt } : {}),
                ...(searchParams.value.updatedAt ? { updatedAt: searchParams.value.updatedAt } : {}),
                ...(searchParams.value.deletedAt ? { deletedAt: searchParams.value.deletedAt } : {}),
                ...(searchParams.value.createdBy ? { createdBy: searchParams.value.createdBy } : {}),
                ...(searchParams.value.tenantId ? { tenantId: searchParams.value.tenantId } : {}),
            };

            const response: TestStudentsListResult = await getTestStudentsList(requestParams);

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

    const createData = async (data: Omit<TestStudentsData, 'stuId'>) => {
        try {
            const response = await createTestStudents(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const updateData = async (data: Partial<TestStudentsData>) => {
        try {
            const response = await updateTestStudents(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const deleteData = async (stuId: number) => {
        try {
            await deleteTestStudents(stuId);
            dataList.value = dataList.value.filter((item: TestStudentsData) => item.stuId !== stuId);
            // 减少总数
            total.value = Math.max(0, total.value - 1);
        } catch (error) {
            throw error;
        }
    };

    // 根据ID获取用户详情
    const getDetail = async (stuId: number) : Promise<TestStudentsResult> => {
        try {
            const response = await getTestStudents(stuId);
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