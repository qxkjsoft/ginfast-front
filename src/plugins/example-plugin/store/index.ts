import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ExampleData } from '../api';
import {
    getExampleData,
    createExampleData,
    updateExampleData,
    deleteExampleData,
} from '../api';

interface ExamplePluginState {
    dataList: ExampleData[];
    loading: boolean;
}

export const useExamplePluginStore = defineStore('example-plugin', () => {
    // State
    const dataList = ref<ExampleData[]>([]);
    const loading = ref<boolean>(false);

    // Getters
    const getDataList = computed(() => dataList.value);
    const isLoading = computed(() => loading.value);

    // Actions
    const fetchDataList = async () => {
        loading.value = true;
        try {
            const response = await getExampleData();
            dataList.value = response || [];
        } finally {
            loading.value = false;
        }
    };

    const createData = async (data: Omit<ExampleData, 'id'>) => {
        try {
            const response = await createExampleData(data);
            dataList.value.push(response);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const updateData = async (id: number, data: Partial<ExampleData>) => {
        try {
            const response = await updateExampleData(id, data);
            const index = dataList.value.findIndex((item: ExampleData) => item.id === id);
            if (index !== -1) {
                dataList.value[index] = response;
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const deleteData = async (id: number) => {
        try {
            await deleteExampleData(id);
            dataList.value = dataList.value.filter((item: ExampleData) => item.id !== id);
        } catch (error) {
            throw error;
        }
    };

    return {
        // State
        dataList,
        loading,

        // Getters
        getDataList,
        isLoading,

        // Actions
        fetchDataList,
        createData,
        updateData,
        deleteData,
    };
});