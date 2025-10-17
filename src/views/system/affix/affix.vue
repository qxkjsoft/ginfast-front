<template>
    <div class="snow-fill">
        <div class="snow-fill-inner container">
            <a-space wrap class="search-box">
                <a-input v-model="form.name" placeholder="请输入文件名" allow-clear />
                <a-select placeholder="文件类型" v-model="form.ftype" style="width: 120px" allow-clear>
                    <a-option value="image">图片</a-option>
                    <a-option value="document">文档</a-option>
                    <a-option value="video">视频</a-option>
                    <a-option value="audio">音频</a-option>
                    <a-option value="other">其他</a-option>
                </a-select>
                <a-button type="primary" @click="search">
                    <template #icon><icon-search /></template>
                    <span>查询</span>
                </a-button>
                <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    <span>重置</span>
                </a-button>
            </a-space>

            <a-row>
                <a-space wrap>
                    <a-upload :custom-request="handleUpload" :show-file-list="false" :disabled="uploadLoading"
                        v-hasPerm="['system:affix:upload']">
                        <template #upload-button>
                            <a-button type="primary" :loading="uploadLoading">
                                <template #icon><icon-plus /></template>
                                <span>上传文件</span>
                            </a-button>
                        </template>
                    </a-upload>
                </a-space>
            </a-row>

            <a-table row-key="id" :data="affixList" :bordered="{ cell: true }" :loading="loading"
                :scroll="{ x: '100%', y: '75%' }" :pagination="pagination" @page-change="handlePageChange"
                @page-size-change="handlePageSizeChange">
                <template #columns>
                    <a-table-column title="序号" :width="64">
                        <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
                    </a-table-column>
                    <a-table-column title="文件名" data-index="name" :ellipsis="true" tooltip
                        :width="200"></a-table-column>
                    <a-table-column title="文件类型" data-index="ftype" :width="90">
                        <template #cell="{ record }">
                            <a-tag v-if="record.ftype === 'image'" color="arcoblue">图片</a-tag>
                            <a-tag v-else-if="record.ftype === 'document'" color="green">文档</a-tag>
                            <a-tag v-else-if="record.ftype === 'video'" color="red">视频</a-tag>
                            <a-tag v-else-if="record.ftype === 'audio'" color="orange">音频</a-tag>
                            <a-tag v-else color="gray">其他</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="后缀" data-index="suffix" :width="70" :ellipsis="true"
                        tooltip></a-table-column>
                    <a-table-column title="文件大小" data-index="size" :width="120">
                        <template #cell="{ record }">{{ formatFileSize(record.size) }}</template>
                    </a-table-column>
                    <a-table-column title="创建人" data-index="createdBy" :width="150">
                        <template #cell="{ record }">{{ record.user ? record.user.nickName : ""
                            }}</template>
                    </a-table-column>
                    <a-table-column title="创建部门" :width="150">
                        <template #cell="{ record }">{{ record.user.department.name }}</template>
                    </a-table-column>
                    <a-table-column title="创建时间" data-index="createdAt" :width="180">
                        <template #cell="{ record }">{{ record.createdAt ? formatTime(record.createdAt) : ""
                            }}</template>
                    </a-table-column>
                    <a-table-column title="操作" :width="320" align="center" :fixed="'right'">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link @click="onDownload(record)" v-hasPerm="['system:affix:download']">
                                    <template #icon><icon-download /></template>
                                    下载
                                </a-link>
                                <a-link @click="copyLink(record)" v-hasPerm="['system:affix:copy']">
                                    <template #icon><icon-copy /></template>
                                    复制链接
                                </a-link>
                                <a-link @click="onEdit(record)" v-hasPerm="['system:affix:updateName']">
                                    <template #icon><icon-edit /></template>
                                    重命名
                                </a-link>
                                <a-popconfirm type="warning" content="确定删除该文件吗?" @ok="onDelete(record)">
                                    <a-link status="danger" v-hasPerm="['system:affix:delete']">
                                        <template #icon><icon-delete /></template>
                                        删除
                                    </a-link>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table-column>
                </template>
            </a-table>
        </div>

        <!-- 重命名对话框 -->
        <a-modal width="40%" v-model:visible="renameModalVisible" @close="afterRenameClose"
            :on-before-ok="handleRenameOk">
            <template #title> 重命名文件 </template>
            <div>
                <a-form ref="renameFormRef" auto-label-width :rules="renameRules" :model="renameForm">
                    <a-form-item field="name" label="文件名" validate-trigger="blur">
                        <a-input v-model="renameForm.name" placeholder="请输入文件名" allow-clear />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import {
    getAffixListAPI,
    deleteAffixAPI,
    updateAffixNameAPI,
    uploadAffixAPI,
    downloadAffixAPI
} from "@/api/file";
import { formatTime } from "@/globals";
import { Message } from "@arco-design/web-vue";
import { handleUrl, copyTextToClipboard } from "@/utils/app";

// 搜索表单
const form = ref({
    name: "",
    ftype: ""
});

// 搜索
const search = () => {
    pagination.value.current = 1;
    getAffixList();
};

// 重置
const reset = () => {
    form.value = {
        name: "",
        ftype: ""
    };
    pagination.value.current = 1;
    getAffixList();
};

// 重命名相关
const renameModalVisible = ref(false);
const renameForm = ref({
    id: 0,
    name: ""
});
const renameRules = {
    name: [
        {
            required: true,
            message: "请输入文件名"
        }
    ]
};
const renameFormRef = ref();

const onEdit = (row: any) => {
    renameForm.value = {
        id: row.id,
        name: row.name
    };
    renameModalVisible.value = true;
};

const handleRenameOk = async () => {
    let state = await renameFormRef.value.validate();
    if (state) return false;

    try {
        await updateAffixNameAPI(renameForm.value);
        Message.success("重命名成功");
        getAffixList();
        return true;
    } catch (error) {
        return false;
    }
};

const afterRenameClose = () => {
    renameFormRef.value.resetFields();
    renameForm.value = {
        id: 0,
        name: ""
    };
};

// 删除文件
const onDelete = async (row: any) => {
    try {
        await deleteAffixAPI({ id: row.id });
        Message.success("删除成功");
        getAffixList();
    } catch (error) {
        // 错误已在http拦截器中处理
    }
};

// 下载文件
const onDownload = async (row: any) => {
    try {
        const res = await downloadAffixAPI(row.id);
        const fileUrl = handleUrl(res.data.url);

        // 检查资源是否存在
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`下载失败: ${response.status} ${response.statusText}`);
        }

        // 获取文件内容为Blob
        const blob = await response.blob();

        // 创建临时下载链接
        const link = document.createElement("a");
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        // 设置download属性，强制浏览器下载而不是在浏览器中打开
        link.setAttribute("download", row.name);
        // 隐藏链接元素
        link.style.display = "none";
        // 添加到DOM中
        document.body.appendChild(link);
        // 触发点击
        link.click();
        // 清理DOM和URL对象
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        Message.success("开始下载");
    } catch (error) {
        // 错误已在http拦截器中处理
    }
};

// 上传文件
const uploadLoading = ref(false);
const handleUpload = async (options: any) => {
    const { fileItem, onError, onSuccess } = options;
    const formData = new FormData();
    formData.append("file", fileItem.file);

    uploadLoading.value = true;
    try {
        await uploadAffixAPI(formData);
        Message.success("上传成功");
        getAffixList();
        onSuccess();
    } catch (error) {
        onError();
    } finally {
        uploadLoading.value = false;
    }
};

// 文件列表
const loading = ref(false);
const affixList = ref<any[]>([]);

const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showPageSize: true,
    showTotal: true,
    showJumper: true
});

const getAffixList = async () => {
    loading.value = true;
    const params = {
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
        ...form.value
    };

    try {
        const { data } = await getAffixListAPI(params);
        affixList.value = data.list;
        pagination.value.total = data.total;
    } catch (error) {
        // 错误已在http拦截器中处理
    } finally {
        loading.value = false;
    }
};

// 分页变化事件处理
const handlePageChange = (page: number) => {
    pagination.value.current = page;
    getAffixList();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1;
    getAffixList();
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 复制链接功能
const copyLink = async (record: any) => {
    try {
        // 获取文件URL
        const url = await getFileUrl(record);

        // 如果没有有效的URL，则提示错误
        if (!url) {
            Message.warning("该文件没有可复制的链接");
            return;
        }

        // 复制URL到剪贴板
        await copyTextToClipboard(url);
    } catch (error) {
        Message.error("复制链接失败");
    }
};

// 获取文件URL
const getFileUrl = async (record: any): Promise<string> => {
    let url = '';

    // 首先尝试通过API获取下载链接
    try {
        const res = await downloadAffixAPI(record.id);
        url = handleUrl(res.data.url);
    } catch (apiError) {
        // API调用失败，使用path字段构造URL
        console.warn('获取下载链接失败，使用url字段:', apiError);
    }

    // 如果API没有返回有效的URL，则尝试使用path字段
    if (!url && record.url) {
        url = handleUrl(record.url);
    }

    return url;
};

onMounted(() => {
    getAffixList();
});
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.search-box {
    margin-bottom: $padding;
    padding: $padding;
    background: $color-bg-1;
    border-radius: $radius-box-1;
}

:deep(.arco-table-container) {
    border-radius: $radius-box-1;
}
</style>