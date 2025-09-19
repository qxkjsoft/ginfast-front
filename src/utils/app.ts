export function getLocalStorage<T>(key: string): T | null {
  try {
    // 从localStorage中获取字符串值
    const item = localStorage.getItem(key);

    // 如果值不存在，返回 null
    if (item === null) {
      return null;
    }

    // 尝试解析 JSON 字符串
    const parsedValue = JSON.parse(item);

    // 返回解析后的值，类型断言为 T
    return parsedValue as T;
  } catch (error) {
    console.error("Error parsing JSON from localStorage:", error);
    // JSON 解析失败时，说明是原始字符串或数值，直接返回
    const item = localStorage.getItem(key);
    // 尝试转换为数值，如果失败则返回原始字符串
    if (item !== null && !isNaN(Number(item))) {
      return Number(item) as T;
    }
    return item as T;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  // 对于字符串和数值直接存储，对象和数组使用 JSON.stringify
  if (typeof value === "string" || typeof value === "number") {
    localStorage.setItem(key, String(value));
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem(key);
}
