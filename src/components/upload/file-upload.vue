<template>
    <div class="file-upload">
        <a-space direction="vertical" :style="{ width: '100%' }">
            <!-- 文件列表 -->
            <div class="file-list" v-if="fileList.length > 0">
                <div v-for="(fileItem, index) in fileList" :key="fileItem.uid || index" class="file-item">
                    <div class="file-info">
                        <icon-file :style="{ fontSize: '20px', marginRight: '8px' }" />
                        <span class="file-name">{{ fileItem.name }}</span>
                        <span class="file-size" v-if="fileItem.size">({{ formatFileSize(fileItem.size) }})</span>
                        <a-tag v-if="fileItem.status === 'done'" color="green" size="small">已上传</a-tag>
                        <a-tag v-else-if="fileItem.status === 'uploading'" color="blue" size="small">
                            上传中 {{ fileItem.percent }}%
                        </a-tag>
                        <a-tag v-else-if="fileItem.status === 'error'" color="red" size="small">上传失败</a-tag>
                    </div>
                    <div class="file-actions">
                        <a-button v-if="fileItem.status === 'done'" type="text" size="small" @click="handleDownload(fileItem)">
                            <template #icon><icon-download /></template>
                            下载
                        </a-button>
                        <a-button v-if="fileItem.status === 'error' && !disabled" type="text" size="small" @click="handleRetry(index)">
                            <template #icon><icon-refresh /></template>
                            重试
                        </a-button>
                        <a-button v-if="!disabled" type="text" size="small" status="danger" @click="handleRemove(index)">
                            <template #icon><icon-delete /></template>
                            删除
                        </a-button>
                    </div>
                </div>
            </div>

            <!-- 上传按钮 -->
            <a-upload
                :action="uploadUrl"
                :fileList="[]"
                :show-file-list="false"
                @change="onChange"
                :accept="accept"
                :multiple="true"
                :limit="maxCount"
                @progress="onProgress"
                :custom-request="handleUpload"
                :disabled="disabled || fileList.length >= maxCount"
            >
                <template #upload-button>
                    <a-button :disabled="disabled || fileList.length >= maxCount" type="outline">
                        <template #icon><icon-upload /></template>
                        {{ title }}
                    </a-button>
                </template>
            </a-upload>

            <!-- 上传数量提示 -->
            <div v-if="maxCount" class="upload-hint">
                已上传 {{ fileList.length }}/{{ maxCount }} 个文件
            </div>
        </a-space>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconUpload, IconFile, IconDelete, IconDownload, IconRefresh } from '@arco-design/web-vue/es/icon';
import { uploadAffixAPI } from '@/api/file';
import { handleUrl } from '@/utils/app';
import { Message } from '@arco-design/web-vue';

// 文件信息接口
interface FileInfo {
    uid: string;
    name: string;
    size: number;
    status: 'done' | 'uploading' | 'error';
    percent?: number;
    url?: string;
    id?: number;
    suffix?: string;
    ftype?: string;
    file?: File;
}

// 定义组件属性
const props = defineProps({
    modelValue: {
        type: String,
        default: '[]'
    },
    title: {
        type: String,
        default: '上传文件'
    },
    accept: {
        type: String,
        default: '*'
    },
    maxCount: {
        type: Number,
        default: 10
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'change', 'success', 'error']);

// 文件列表
const fileList = ref<FileInfo[]>([]);

// 跟踪正在上传的文件数量
const uploadingCount = ref(0);

// 从 modelValue 解析文件列表
const parseFileList = (jsonStr: string): FileInfo[] => {
    if (!jsonStr || typeof jsonStr !== 'string') {
        return [];
    }
    try {
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data)) {
            return data.map((item: any, index) => ({
                uid: `existing-${index}`,
                name: item.name || '',
                size: item.size || 0,
                status: 'done',
                url: item.url || '',
                id: item.id,
                suffix: item.suffix,
                ftype: item.ftype
            }));
        }
    } catch (e) {
        console.error('解析文件列表失败:', e);
    }
    return [];
};

// 将文件列表转换为 JSON 字符串
const stringifyFileList = (): string => {
    const files = fileList.value
        .filter(file => file.status === 'done' && file.url)
        .map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            url: file.url,
            suffix: file.suffix,
            ftype: file.ftype
        }));
    return JSON.stringify(files);
};

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    if (uploadingCount.value === 0) {
        fileList.value = parseFileList(newVal);
    }
}, { immediate: true });

// 上传URL（不需要action，因为我们使用自定义请求）
const uploadUrl = '/'; // 占位符，实际不会使用

// 处理文件变化
const onChange = (fileList: any[], currentFile: any) => {
    console.log("onChange - fileList:", fileList, "currentFile:", currentFile);
};

// 处理上传进度
const onProgress = (currentFile: any) => {
    const fileIndex = fileList.value.findIndex(file => file.uid === currentFile.uid);
    if (fileIndex !== -1) {
        fileList.value[fileIndex] = {
            ...fileList.value[fileIndex],
            percent: currentFile.percent
        };
    }
};

// 自定义上传处理
const handleUpload = async (options: any) => {
    const { fileItem, onError, onSuccess } = options;
    const formData = new FormData();
    formData.append("file", fileItem.file);

    // 生成唯一ID
    const fileUid = fileItem.uid;

    // 检查文件后缀
    if (props.accept !== '*') {
        const acceptTypes = props.accept.split(',').map(type => type.trim());
        const fileExtension = '.' + fileItem.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExtension === type.toLowerCase();
            }
            return fileItem.type.includes(type.replace('*', ''));
        });
        if (!isAccepted) {
            Message.error(`不支持的文件类型，请选择 ${props.accept} 格式的文件`);
            onError(new Error('文件类型不支持'));
            return;
        }
    }

    // 添加到文件列表，显示上传中状态
    const uploadingFile: FileInfo = {
        uid: fileUid,
        name: fileItem.name,
        size: fileItem.size,
        status: 'uploading',
        percent: 0,
        file: fileItem.file
    };
    fileList.value.push(uploadingFile);
    uploadingCount.value++;

    try {
        const res: any = await uploadAffixAPI(formData);
        console.log("上传成功:", res);
        if (res.code === 0) {
            Message.success("上传成功");
            // 更新文件状态
            const fileIndex = fileList.value.findIndex(file => file.uid === fileUid);
            if (fileIndex !== -1) {
                fileList.value[fileIndex] = {
                    ...fileList.value[fileIndex],
                    status: 'done',
                    url: res.data.url,
                    id: res.data.id,
                    suffix: res.data.suffix,
                    ftype: res.data.ftype,
                    size: res.data.size ?? fileList.value[fileIndex].size,
                };
            }
            uploadingCount.value--;
            // 更新父组件的值
            emit('update:modelValue', stringifyFileList());
            emit('success', res.data);
            emit('change', fileList.value);
            onSuccess(res);
        } else {
            throw new Error(res.message || '上传失败');
        }
    } catch (error: any) {
        Message.error(error.message || "上传失败");
        // 更新文件状态为错误
        const fileIndex = fileList.value.findIndex(file => file.uid === fileUid);
        if (fileIndex !== -1) {
            fileList.value[fileIndex] = {
                ...fileList.value[fileIndex],
                status: 'error'
            };
        }
        uploadingCount.value--;
        emit('error', error);
        onError(error);
    }
};

// 删除文件
const handleRemove = (index: number) => {
    const removedFile = fileList.value[index];
    if (removedFile.status === 'uploading') {
        uploadingCount.value--;
    }
    fileList.value.splice(index, 1);
    emit('update:modelValue', stringifyFileList());
    emit('change', fileList.value);
    Message.success('删除成功');
};

// 重试上传
const handleRetry = (index: number) => {
    const fileItem = fileList.value[index];
    if (fileItem.file) {
        // 移除失败的文件
        fileList.value.splice(index, 1);
        // 重新上传
        handleUpload({
            fileItem: {
                uid: Date.now().toString(),
                name: fileItem.name,
                size: fileItem.size,
                file: fileItem.file
            },
            onError: () => {},
            onSuccess: () => {}
        });
    }
};

// 下载文件
const handleDownload = async (fileItem: FileInfo) => {
    if (!fileItem.url) return;
    try {
        const fileUrl = handleUrl(fileItem.url);
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`下载失败: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        const link = document.createElement('a');
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        // blob 链接设置 download 属性才会触发下载而不是打开
        link.setAttribute('download', fileItem.name);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        Message.success('开始下载');
    } catch (error) {
        console.error('下载文件失败:', error);
        Message.error('下载文件失败');
    }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>

<style scoped>
.file-upload {
    width: 100%;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--color-fill-1);
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    transition: all 0.2s;
    min-height: 40px;
}

.file-item:hover {
    background-color: var(--color-fill-2);
    border-color: var(--color-border-3);
}

.file-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 6px;
    flex-wrap: wrap;
}

.file-name {
    font-size: 14px;
    color: var(--color-text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
}

.file-size {
    font-size: 12px;
    color: var(--color-text-3);
    flex-shrink: 0;
}

.file-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    margin-left: 8px;
}

.upload-hint {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 4px;
}
</style>
