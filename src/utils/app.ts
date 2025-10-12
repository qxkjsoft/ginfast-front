import _ from "lodash"
import { Message, Modal } from "@arco-design/web-vue";

// 从 localStorage 获取项
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

// 设置 localStorage 项
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

// 处理URL，添加基础URL
export function handleUrl(url: string, baseUrl = '') {
    if (!url) {
        return ''
    }
    if (url.startsWith("http") || url.startsWith("https")) {
        return url
    }

    if (!baseUrl) {
        baseUrl = import.meta.env.VITE_APP_BASE_URL
    }

    if (baseUrl.startsWith("http") || baseUrl.startsWith("https")) {
        return _.trimEnd(baseUrl, '/') + '/' + _.trimStart(url, "/")
    } else {
        const u = new URL(window.location.href);
        const protocol = u.protocol;
        const domain = u.hostname;
        const port = u.port !== "" ? `:${u.port}` : "";
        return `${protocol}//${domain}${port}${_.trimEnd(baseUrl, '/')}/${_.trimStart(url, "/")}`
    }
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        // 使用现代Clipboard API
        await navigator.clipboard.writeText(text);
        Message.success("链接已复制到剪贴板");
        return true;
    } catch (error) {
        // Clipboard API可能因为权限问题失败，尝试备选方案
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // 避免滚动到底部
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                Message.success("链接已复制到剪贴板");
                return true;
            } else {
                Message.error("复制链接失败");
                return false;
            }
        } catch (fallbackError) {
            Message.error("复制链接失败");
            return false;
        }
    }
}

// 节流的 Modal.confirm 函数，每3秒最多调用一次
let lastCallTime = 0;
export const throttledModalConfirm = (options: {
    title: string;
    content: string;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
}) => {
    const now = Date.now();
    if (now - lastCallTime >= 3000) {
        lastCallTime = now;
        Modal.confirm({
            title: options.title,
            content: options.content,
            okText: options.okText || '确定',
            cancelText: options.cancelText || '取消',
            onOk: options.onOk,
            onCancel: options.onCancel
        });
    }
};
