import { stringify } from "qs";

/**
 * 序列化 GET 查询参数。
 * arrayFormat: "repeat" 生成 `deptIds=1&deptIds=2` 形式，与后端 Gin 的数组绑定规则一致；
 * qs 默认的 `deptIds[0]=1&deptIds[1]=2` 无法被 Gin 识别，会导致数组筛选条件静默失效。
 */
export function serializeParams(params: Record<string, any>): string {
    return stringify(params, { arrayFormat: "repeat" });
}
