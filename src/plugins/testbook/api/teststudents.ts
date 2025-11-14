import { http } from '@/utils/http';
import { baseUrlApi } from "@/api/utils";

import { BaseResult } from "@/api/types";


export interface TestStudentsData {
    stuId: number; // ID
    stuName: string; // 姓名
    age: number; // 年龄
    gender: string; // 性别
    className: string; // 班级名称
    admissionDate: string; // 入学日期
    email: string; //  邮箱
    phone: string; // 电话号码
    address: string; // 地址
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
    deletedAt: string; // 删除时间
    createdBy: number; // 创建人
    tenantId: number; // 租户ID字段
}

export type TestStudentsListResult = BaseResult<{
    list: TestStudentsData[];
    total: number;
}>;

export interface TestStudentsListParams {
    pageNum: number;
    pageSize: number;
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
}


export type TestStudentsResult = BaseResult<TestStudentsData>;

export const getTestStudentsList = (params: TestStudentsListParams) => {
    return http.request<TestStudentsListResult>("get", baseUrlApi("plugins/testbook/teststudents/list"), { params });
};

export const createTestStudents = (data: Omit<TestStudentsData, 'stuId'>) => {
    return http.request<TestStudentsData>("post", baseUrlApi("plugins/testbook/teststudents/add"), { data });
};

export const updateTestStudents= (data: Partial<TestStudentsData>) => {
    return http.request<TestStudentsData>("put", baseUrlApi(`plugins/testbook/teststudents/edit`), { data });
};

export const deleteTestStudents = (stuId: number) => {
    return http.request<BaseResult>("delete", baseUrlApi(`plugins/testbook/teststudents/delete`), { data: { stuId } });
};


export const getTestStudents = (stuId: number) => {
    return http.request<TestStudentsResult>("get", baseUrlApi(`plugins/testbook/teststudents/${stuId}`));
};