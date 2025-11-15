import { http } from '@/utils/http';
import { baseUrlApi } from "@/api/utils";

import { BaseResult } from "@/api/types";


export interface TestTeacherData {
    tcId: number; // 主键ID
    tcName: string; // 教师姓名
    employeeId: string; // 工号
    gender: number; // 性别：0-未知 1-男 2-女
    phone: string; // 手机号
    email: string; // 邮箱
    subject: string; // 所教学科
    title: string; // 职称
    status: number; // 状态：0-离职 1-在职
    hireDate: string; // 入职日期
    birthDate: string; // 出生日期
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
    deletedAt: string; // 删除时间
    createdBy: number; // 创建人
}

export type TestTeacherListResult = BaseResult<{
    list: TestTeacherData[];
    total: number;
}>;

export interface TestTeacherListParams {
    pageNum: number;
    pageSize: number;
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
}


export type TestTeacherResult = BaseResult<TestTeacherData>;

export const getTestTeacherList = (params: TestTeacherListParams) => {
    return http.request<TestTeacherListResult>("get", baseUrlApi("plugins/testbook/testteacher/list"), { params });
};

export const createTestTeacher = (data: Omit<TestTeacherData, 'tcId'>) => {
    return http.request<TestTeacherData>("post", baseUrlApi("plugins/testbook/testteacher/add"), { data });
};

export const updateTestTeacher= (data: Partial<TestTeacherData>) => {
    return http.request<TestTeacherData>("put", baseUrlApi(`plugins/testbook/testteacher/edit`), { data });
};

export const deleteTestTeacher = (tcId: number) => {
    return http.request<BaseResult>("delete", baseUrlApi(`plugins/testbook/testteacher/delete`), { data: { tcId } });
};


export const getTestTeacher = (tcId: number) => {
    return http.request<TestTeacherResult>("get", baseUrlApi(`plugins/testbook/testteacher/${tcId}`));
};