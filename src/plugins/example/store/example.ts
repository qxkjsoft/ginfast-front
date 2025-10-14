import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ExampleData, ExampleListParams, ExampleListResult } from '../api/example';
import {
    getExampleList,
    createExampleData,
    updateExampleData,
    deleteExampleData,
} from '../api/example';


export const useExamplePluginStore = defineStore('example-plugin', () => {
    // State
    const dataList = ref<ExampleData[]>([]);
    const loading = ref<boolean>(false);
    const total = ref<number>(0);
    const currentPage = ref<number>(1);
    const pageSize = ref<number>(10);
    const searchParams = ref<{
        name?: string;
    }>({});

    // Getters
    const getDataList = computed(() => dataList.value);
    const isLoading = computed(() => loading.value);
    const getTotal = computed(() => total.value);
    const getCurrentPage = computed(() => currentPage.value);
    const getPageSize = computed(() => pageSize.value);
    const getSearchParams = computed(() => searchParams.value);

    // Actions
    const fetchDataList = async (params?: Partial<ExampleListParams>) => {
        loading.value = true;
        try {
            // 更新分页参数
            if (params?.pageNum !== undefined) {
                currentPage.value = params.pageNum;
            }
            if (params?.pageSize !== undefined) {
                pageSize.value = params.pageSize;
            }
            if (params?.name !== undefined) {
                searchParams.value.name = params.name;
            }

            // 构造请求参数
            const requestParams: ExampleListParams = {
                pageNum: currentPage.value,
                pageSize: pageSize.value,
                ...(searchParams.value.name ? { name: searchParams.value.name } : {}),
            };

            const response: ExampleListResult = await getExampleList(requestParams);

            // 根据返回的数据结构处理
            if (Array.isArray(response.data.list)) {
                // 如果返回的是数组格式（旧格式）
                dataList.value = response.data.list || [];
                total.value = response.data.total || 0;
                console.log("dataList", dataList.value);
            }
        } finally {
            loading.value = false;
        }
    };

    const createData = async (data: Omit<ExampleData, 'id'>) => {
        try {
            const response = await createExampleData(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const updateData = async (data: Partial<ExampleData>) => {
        try {
            const response = await updateExampleData(data);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const deleteData = async (id: number) => {
        try {
            await deleteExampleData(id);
            dataList.value = dataList.value.filter((item: ExampleData) => item.id !== id);
            // 减少总数
            total.value = Math.max(0, total.value - 1);
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
    };
});