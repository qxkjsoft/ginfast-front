import { http } from '@/utils/http';

export interface ExampleData {
    id: number;
    name: string;
    description: string;
}

export const getExampleData = () => {
    return http.request<ExampleData[]>("get", "/example/data");
};

export const createExampleData = (data: Omit<ExampleData, 'id'>) => {
    return http.request<ExampleData>("post", "/example/data", { data });
};

export const updateExampleData = (id: number, data: Partial<ExampleData>) => {
    return http.request<ExampleData>("put", `/example/data/${id}`, { data });
};

export const deleteExampleData = (id: number) => {
    return http.request<void>("delete", `/example/data/${id}`);
};