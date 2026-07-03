<template>
    <div class="chunk-upload">
        <!-- 拖拽上传区域 -->
        <div
            class="upload-dropzone"
            :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
        >
            <div class="dropzone-content">
                <icon-upload :style="{ fontSize: '32px', color: 'var(--color-text-3)' }" />
                <p class="dropzone-text">拖拽文件到此处 或 <span class="dropzone-link">点击选择文件</span></p>
                <p class="dropzone-hint">支持大文件分片上传，单文件最大 {{ formatFileSize(resolvedMaxFileSize) }}</p>
            </div>
        </div>
        <input
            ref="fileInputRef"
            type="file"
            :accept="accept"
            :multiple="true"
            style="display: none"
            @change="onFileInputChange"
        />

        <!-- 文件列表 -->
        <div class="file-list" v-if="fileList.length > 0">
            <div v-for="(item, index) in fileList" :key="item.uid" class="file-item">
                <div class="file-info">
                    <icon-file :style="{ fontSize: '18px', marginRight: '8px', flexShrink: 0 }" />
                    <span class="file-name" :title="item.name">{{ item.name }}</span>
                    <span class="file-size">({{ formatFileSize(item.size) }})</span>
                    <!-- 状态标签 -->
                    <a-tag v-if="item.status === 'done'" color="green" size="small">已上传</a-tag>
                    <a-tag v-else-if="item.status === 'hashing'" color="purple" size="small">
                        计算哈希 {{ item.progress?.hashingPercent || 0 }}%
                    </a-tag>
                    <a-tag v-else-if="item.status === 'uploading'" color="blue" size="small">
                        上传中 {{ item.progress?.percent || 0 }}%
                    </a-tag>
                    <a-tag v-else-if="item.status === 'paused'" color="orange" size="small">已暂停</a-tag>
                    <a-tag v-else-if="item.status === 'merging'" color="cyan" size="small">合并中...</a-tag>
                    <a-tag v-else-if="item.status === 'waiting'" color="gray" size="small">等待中</a-tag>
                    <a-tag v-else-if="item.status === 'error'" color="red" size="small">上传失败</a-tag>
                </div>

                <!-- 进度条（上传中/暂停/合并中时显示） -->
                <div
                    v-if="item.status === 'uploading' || item.status === 'paused' || item.status === 'hashing' || item.status === 'merging'"
                    class="file-progress"
                >
                    <a-progress
                        :percent="(item.progress?.percent || 0) / 100"
                        :status="item.status === 'paused' ? 'warning' : 'normal'"
                        size="small"
                        :show-text="false"
                    />
                    <div class="progress-detail" v-if="item.status === 'uploading'">
                        <span v-if="item.progress?.currentSpeed">{{ item.progress.currentSpeed }}</span>
                        <span v-if="item.progress?.remainingTime">剩余 {{ item.progress.remainingTime }}</span>
                        <span v-if="item.progress?.totalChunks">
                            分片 {{ item.progress.uploadedChunks }}/{{ item.progress.totalChunks }}
                        </span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="file-actions">
                    <!-- 暂停按钮 -->
                    <a-button
                        v-if="item.status === 'uploading' || item.status === 'hashing'"
                        type="text"
                        size="small"
                        @click.stop="handlePause(index)"
                    >
                        <template #icon><icon-pause /></template>
                        暂停
                    </a-button>
                    <!-- 恢复按钮 -->
                    <a-button
                        v-if="item.status === 'paused'"
                        type="text"
                        size="small"
                        @click.stop="handleResume(index)"
                    >
                        <template #icon><icon-play-arrow /></template>
                        恢复
                    </a-button>
                    <!-- 重试按钮 -->
                    <a-button
                        v-if="item.status === 'error'"
                        type="text"
                        size="small"
                        @click.stop="handleRetry(index)"
                    >
                        <template #icon><icon-refresh /></template>
                        重试
                    </a-button>
                    <!-- 删除按钮 -->
                    <a-button
                        type="text"
                        size="small"
                        status="danger"
                        @click.stop="handleRemove(index)"
                    >
                        <template #icon><icon-delete /></template>
                        {{ item.status === "done" ? "删除" : "取消" }}
                    </a-button>
                </div>
            </div>
        </div>

        <!-- 上传数量提示 -->
        <div v-if="maxCount" class="upload-hint">
            已上传 {{ doneCount }}/{{ maxCount }} 个文件
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { uploadAffixAPI } from "@/api/file";
import { ChunkUploader, type ChunkProgress, getChunkUploadConfig } from "@/utils/chunk-upload";

// 文件项接口
interface FileItem {
    uid: string;    // 文件项的唯一标识符
    name: string;   // 文件项的名称
    size: number;   // 文件项的大小（字节）
    status: "waiting" | "hashing" | "uploading" | "paused" | "merging" | "done" | "error";  // 文件项的状态
    progress?: ChunkProgress;   // 文件项的进度信息
    file?: File;    // 文件项对应的File对象
    uploader?: ChunkUploader;   // 文件项的分片上传实例
    result?: any;   // 文件项的上传结果
}

// 定义组件属性
const props = defineProps({
    modelValue: {
        type: String,
        default: "[]"
    },
    // 接受的文件类型，例如：".jpg,.png,.pdf" 或 "*" 表示接受所有类型
    accept: {
        type: String,
        default: "*"
    },
    // 最大上传文件数量
    maxCount: {
        type: Number,
        default: 10
    },
    // 单个文件最大大小（字节），0 表示使用环境变量或默认值
    maxFileSize: {
        type: Number,
        default: 0
    },
    // 分片上传时每片的大小（字节），0 表示使用环境变量或默认值
    chunkSize: {
        type: Number,
        default: 0
    },
    // 并发上传的分片数量，0 表示使用环境变量或默认值
    concurrency: {
        type: Number,
        default: 0
    },
    // 分片上传失败时的最大重试次数，0 表示使用环境变量或默认值
    maxRetry: {
        type: Number,
        default: 0
    },
    // 大文件阈值（字节），超过此大小的文件将使用分片上传，0 表示使用环境变量或默认值
    largeFileThreshold: {
        type: Number,
        default: 0
    },
    // 是否自动开始上传，true 表示选择文件后自动上传，false 表示需要手动触发上传
    autoStart: {
        type: Boolean,
        default: true
    }
});

// 定义事件
const emit = defineEmits(["update:modelValue", "change", "success", "error", "progress"]);

// 文件列表
const fileList = ref<FileItem[]>([]);
const isDragover = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// 已上传数量
const doneCount = computed(() => fileList.value.filter(f => f.status === "done").length);

// 是否禁用
const disabled = computed(() => fileList.value.length >= props.maxCount);

// 解析最大文件大小：优先使用 prop，其次使用环境变量或默认值
const resolvedMaxFileSize = computed(() => props.maxFileSize > 0 ? props.maxFileSize : getChunkUploadConfig().maxFileSize);

// 获取上传配置
function getUploaderConfig() {
    const overrides: Record<string, number> = {};
    if (props.chunkSize > 0) overrides.chunkSize = props.chunkSize;
    if (props.concurrency > 0) overrides.concurrency = props.concurrency;
    if (props.maxRetry > 0) overrides.maxRetry = props.maxRetry;
    if (props.largeFileThreshold > 0) overrides.largeFileThreshold = props.largeFileThreshold;
    return overrides;
}

// 创建上传器
function createUploader(): ChunkUploader {
    return new ChunkUploader(getUploaderConfig());
}

// 拖拽事件
function onDragOver() {
    if (!disabled.value) {
        isDragover.value = true;
    }
}

// 拖拽离开
function onDragLeave() {
    isDragover.value = false;
}

// 拖拽结束
function onDrop(e: DragEvent) {
    isDragover.value = false;
    if (disabled.value) return;

    const files = e.dataTransfer?.files;
    if (files) {
        addFiles(Array.from(files));
    }
}

// 点击触发文件选择
function triggerFileInput() {
    if (disabled.value) return;
    fileInputRef.value?.click();
}

// 文件选择变化
function onFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
        addFiles(Array.from(input.files));
        input.value = ""; // 清空以允许重复选择
    }
}

// 添加文件
function addFiles(files: File[]) {
    for (const file of files) {
        // 检查数量限制
        if (fileList.value.length >= props.maxCount) {
            Message.warning(`最多上传 ${props.maxCount} 个文件`);
            break;
        }

        // 检查文件大小
        if (file.size > resolvedMaxFileSize.value) {
            Message.error(`文件 ${file.name} 超过大小限制 ${formatFileSize(resolvedMaxFileSize.value)}`);
            continue;
        }

        const uid = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const fileItem: FileItem = {
            uid,
            name: file.name,
            size: file.size,
            status: "waiting",
            file
        };

        fileList.value.push(fileItem);

        if (props.autoStart) {
            startUpload(fileList.value.length - 1);
        }
    }
}

// 开始上传
async function startUpload(index: number) {
    const item = fileList.value[index];
    if (!item?.file) return;

    const uploader = createUploader();
    item.uploader = uploader;

    // 判断是否使用分片上传
    if (uploader.shouldUseChunkUpload(item.file)) {
        // 分片上传
        item.status = "hashing";
        try {
            await uploader.upload(item.file, {
                onProgress: (progress: ChunkProgress) => {
                    if (fileList.value[index]) {
                        fileList.value[index].progress = { ...progress };
                        fileList.value[index].status = progress.status as FileItem["status"];
                        emit("progress", progress, item);
                    }
                },
                onSuccess: (result: any) => {
                    if (fileList.value[index]) {
                        fileList.value[index].status = "done";
                        fileList.value[index].result = result;
                        emit("success", result, item);
                        emit("update:modelValue", stringifyFileList());
                        emit("change", fileList.value);
                    }
                },
                onError: (error: Error) => {
                    if (fileList.value[index]) {
                        fileList.value[index].status = "error";
                        emit("error", error, item);
                    }
                }
            });
        } catch (error: any) {
            // 已在回调中处理
        }
    } else {
        // 普通上传
        item.status = "uploading";
        item.progress = {
            status: "uploading",
            totalChunks: 1,
            uploadedChunks: 0,
            percent: 0,
            currentSpeed: "",
            remainingTime: "",
            hashingPercent: 0
        };

        const formData = new FormData();
        formData.append("file", item.file);

        try {
            const res: any = await uploadAffixAPI(formData);
            if (res.code === 0) {
                item.status = "done";
                item.result = res.data;
                item.progress = { ...item.progress, percent: 100, uploadedChunks: 1 };
                emit("success", res.data, item);
                emit("update:modelValue", stringifyFileList());
                emit("change", fileList.value);
            } else {
                throw new Error(res.message || "上传失败");
            }
        } catch (error: any) {
            item.status = "error";
            Message.error(error?.message || "上传失败");
            emit("error", error, item);
        }
    }
}

// 暂停上传
function handlePause(index: number) {
    const item = fileList.value[index];
    if (item?.uploader) {
        item.uploader.pause();
        item.status = "paused";
    }
}

// 恢复上传 - 直接调用 uploader 的 resume 方法，复用同一实例
function handleResume(index: number) {
    const item = fileList.value[index];
    if (item?.uploader) {
        item.status = "uploading";
        item.uploader.resume(); // 不再创建新 uploader，跳过 MD5 重新计算
    }
}

// 重试上传
function handleRetry(index: number) {
    const item = fileList.value[index];
    if (item?.file) {
        item.status = "waiting";
        item.progress = undefined;
        startUpload(index);
    }
}

// 删除/取消
async function handleRemove(index: number) {
    const item = fileList.value[index];
    if (item?.uploader && (item.status === "uploading" || item.status === "paused" || item.status === "hashing")) {
        await item.uploader.cancel();
    }
    fileList.value.splice(index, 1);
    emit("update:modelValue", stringifyFileList());
    emit("change", fileList.value);
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 将文件列表转换为 JSON 字符串
function stringifyFileList(): string {
    const files = fileList.value
        .filter(file => file.status === "done" && file.result)
        .map(file => ({
            id: file.result.id,
            name: file.result.name || file.name,
            size: file.result.size || file.size,
            url: file.result.url,
            suffix: file.result.suffix,
            ftype: file.result.ftype
        }));
    return JSON.stringify(files);
}

// 清除已完成的文件
function clearDone() {
    fileList.value = fileList.value.filter(item => item.status !== "done");
}

// 重置文件列表（全部清空）
function reset() {
    // 取消所有正在上传的任务
    for (const item of fileList.value) {
        if (item.uploader && (item.status === "uploading" || item.status === "paused" || item.status === "hashing")) {
            item.uploader.cancel();
        }
    }
    // 清空文件列表
    fileList.value = [];
}

// 暴露方法给父组件
defineExpose({
    reset,
    clearDone
});
</script>

<style lang="scss" scoped>
.chunk-upload {
    width: 100%;
}

.upload-dropzone {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--color-border-2);
    border-radius: var(--border-radius-small);
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--color-fill-1);

    &:hover {
        border-color: rgb(var(--primary-6));
        background: var(--color-fill-2);
    }

    &.is-dragover {
        border-color: rgb(var(--primary-6));
        background: rgb(var(--primary-1));
    }

    &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
}

.dropzone-content {
    text-align: center;
}

.dropzone-text {
    margin: 8px 0 4px;
    color: var(--color-text-2);
    font-size: 14px;
}

.dropzone-link {
    color: rgb(var(--primary-6));
}

.dropzone-hint {
    margin: 0;
    color: var(--color-text-3);
    font-size: 12px;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
}

.file-item {
    display: flex;
    flex-direction: column;
    padding: 10px 12px;
    background-color: var(--color-fill-1);
    border: 1px solid var(--color-border-2);
    border-radius: var(--border-radius-small);
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-fill-2);
        border-color: var(--color-border-3);
    }
}

.file-info {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.file-name {
    font-size: 14px;
    color: var(--color-text-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
}

.file-size {
    font-size: 12px;
    color: var(--color-text-3);
    flex-shrink: 0;
}

.file-progress {
    margin-top: 8px;
    padding-left: 26px;
}

.progress-detail {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-3);
}

.file-actions {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    justify-content: flex-end;
}

.upload-hint {
    font-size: 12px;
    color: var(--color-text-3);
    margin-top: 8px;
}
</style>
