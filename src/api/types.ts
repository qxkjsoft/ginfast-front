/** 基础响应接口 */
export interface BaseResult<T = any> {
  code: number;
  data: T;
  message: string;
}
