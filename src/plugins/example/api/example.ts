import { http } from '@/utils/http';
import { baseUrlApi } from "@/api/utils";

import { BaseResult } from "@/api/types";


export interface ExampleData {
    id: number;
    name: string;
    description: string;
}

export type ExampleListResult = BaseResult<{
    list: ExampleData[];
    total: number;
}>;

export interface ExampleListParams {
    pageNum: number;
    pageSize: number;
    name?: string;
}


export type ExampleResult = BaseResult<ExampleData>;

export const getExampleList = (params: ExampleListParams) => {
    return http.request<ExampleListResult>("get", baseUrlApi("plugins/example/list"), { params });
};

export const createExample = (data: Omit<ExampleData, 'id'>) => {
    return http.request<ExampleData>("post", baseUrlApi("plugins/example/add"), { data });
};

export const updateExample= (data: Partial<ExampleData>) => {
    return http.request<ExampleData>("put", baseUrlApi(`plugins/example/edit`), { data });
};

export const deleteExample = (id: number) => {
    return http.request<BaseResult>("delete", baseUrlApi(`plugins/example/delete`), { data: { id } });
};


export const getExample = (id: number) => {
    return http.request<ExampleResult>("get", baseUrlApi(`plugins/example/${id}`));
};