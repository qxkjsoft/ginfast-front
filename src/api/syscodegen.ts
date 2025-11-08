import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import { BaseResult } from "./types";

/** 数据库信息 */
export interface DatabaseInfo {
  name: string;
}

/** 表信息 */
export interface TableInfo {
  tableName: string;
  tableComment: string;
}

/** 字段信息 */
export interface ColumnInfo {
  name: string;
  type: string;
  comment: string;
  isNullable: boolean;
  defaultValue: string;
  isPrimaryKey: boolean;
}

/** 数据库列表响应 */
export type DatabasesResponse = BaseResult<{
  databases: DatabaseInfo[];
}>;

/** 表列表响应 */
export type TablesResponse = BaseResult<{
  tables: TableInfo[];
}>;

/** 字段列表响应 */
export type ColumnsResponse = BaseResult<{
  columns: ColumnInfo[];
}>;

/**
 * 获取数据库列表
 * @returns 数据库列表
 */
export const getDatabases = () => {
  return http.request<DatabasesResponse>("get", baseUrlApi("codegen/databases"));
};

/**
 * 获取指定数据库中的表列表
 * @param database 数据库名称
 * @returns 表列表
 */
export const getTables = (database: string) => {
  return http.request<TablesResponse>("get", baseUrlApi("codegen/tables"), {
    params: { database }
  });
};

/**
 * 获取指定表的字段信息
 * @param database 数据库名称
 * @param table 表名
 * @returns 字段列表
 */
export const getTableColumns = (database: string, table: string) => {
  return http.request<ColumnsResponse>("get", baseUrlApi("codegen/columns"), {
    params: { database, table }
  });
};