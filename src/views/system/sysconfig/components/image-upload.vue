<template>
    <a-space direction="vertical" :style="{ width: '100%' }">
        <a-upload :action="uploadUrl" :fileList="fileList" :show-file-list="false" @change="onChange" :accept="accept"
            @progress="onProgress" :custom-request="handleUpload">
            <template #upload-button>
                <div
                    :class="`arco-upload-list-item${file && file.status === 'error' ? ' arco-upload-list-item-error' : ''}`">
                    <div class="arco-upload-list-picture custom-upload-avatar" v-if="file && file.url"
                        :style="{ width: typeof width === 'number' ? width + 'px' : width, height: typeof height === 'number' ? height + 'px' : height }">
                        <img :src="handleUrl(file.url)"
                            :style="{ width: typeof width === 'number' ? width + 'px' : width, height: typeof height === 'number' ? height + 'px' : height }" />
                        <div class="arco-upload-list-picture-mask">
                            <IconEdit />
                        </div>
                        <a-progress v-if="file.status === 'uploading' && file.percent < 100" :percent="file.percent"
                            type="circle" size="mini" :style="{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translateX(-50%) translateY(-50%)',
                            }" />
                    </div>
                    <div class="arco-upload-picture-card" v-else
                        :style="{ width: typeof width === 'number' ? width + 'px' : width, height: typeof height === 'number' ? height + 'px' : height }">
                        <div class="arco-upload-picture-card-text">
                            <IconPlus />
                            <div style="font-weight: 600">{{ title }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </a-upload>
    </a-space>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon';
import { uploadAffixAPI } from '@/api/file';
import { Message } from '@arco-design/web-vue';
import { handleUrl } from "@/utils/app";
// 定义组件属性
const props = defineProps({
    imageUrl: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: 'Upload'
    },
    accept: {
        type: String,
        default: 'image/*'
    },
    width: {
        type: [String, Number],
        default: 120
    },
    height: {
        type: [String, Number],
        default: 120
    }
});

// 定义事件
const emit = defineEmits(['update:imageUrl']);

// 文件状态
const file = ref<any>(null);
const fileList = ref<any[]>([]);

// 监听图片URL变化
watch(() => props.imageUrl, (newUrl) => {
    if (newUrl) {
        file.value = {
            url: newUrl,
            status: 'done'
        };
        fileList.value = [file.value];
    } else {
        file.value = null;
        fileList.value = [];
    }
}, { immediate: true });

// 上传URL（不需要action，因为我们使用自定义请求）
const uploadUrl = '/'; // 占位符，实际不会使用

// 处理文件变化
const onChange = (_: any, currentFile: any) => {
    file.value = {
        ...currentFile,
        url: currentFile?.file?.status === 'done' ? currentFile?.response?.data?.url : currentFile?.url
    };

    // 如果上传成功，更新父组件的URL
    if (currentFile?.file?.status === 'done' && currentFile?.response?.data?.url) {
        emit('update:imageUrl', currentFile.response.data.url);
    }
};

// 处理上传进度
const onProgress = (currentFile: any) => {
    file.value = currentFile;
};

// 自定义上传处理
const handleUpload = async (options: any) => {
    const { fileItem, onError, onSuccess } = options;
    const formData = new FormData();
    formData.append("file", fileItem.file);

    try {
        const res: any = await uploadAffixAPI(formData);
        if (res.code === 0) {
            Message.success("上传成功");
            // 设置文件信息
            const uploadedFile = {
                ...fileItem,
                status: 'done',
                url: res.data.url,
                response: res
            };

            file.value = uploadedFile;
            fileList.value = [uploadedFile];

            // 通知父组件更新URL
            emit('update:imageUrl', res.data.url);
            onSuccess(res);
        } else {
            throw new Error(res.message || '上传失败');
        }
    } catch (error: any) {
        Message.error(error.message || "上传失败");
        file.value = {
            ...fileItem,
            status: 'error'
        };
        onError(error);
    }
};
</script>

<style scoped>
.arco-upload-list-picture {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
}

.arco-upload-list-picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.arco-upload-list-picture-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
}

.arco-upload-list-picture:hover .arco-upload-list-picture-mask {
    opacity: 1;
}

.arco-upload-picture-card {
    border: 1px dashed var(--color-border-2);
    border-radius: 4px;
    background-color: var(--color-fill-2);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.arco-upload-picture-card:hover {
    border-color: var(--color-primary);
    background-color: var(--color-primary-light-1);
}

.arco-upload-picture-card-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--color-text-2);
}
</style>