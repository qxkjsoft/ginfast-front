<template>
    <a-drawer :visible="drawerVisible" @ok="handleEdit" @cancel="handleCancel" :ok-loading="editLoading"
        :width="layoutMode.width" :title="title">
        <a-form ref="editFormRef" auto-label-width :layout="layoutMode.layout" :model="editForm">
            <a-tabs default-active-key="1">
                <a-tab-pane key="1" title="基本信息">
                    <a-card class="mb-4">
                        <a-row :gutter="24">
                            <a-col :span="12">
                                <a-form-item label="表名" field="name">
                                    <a-input v-model="editForm.name" disabled />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="目录/模块" field="moduleName"
                                    :rules="[{ required: true, message: '模块名称不能为空' }]">
                                    <a-input v-model="editForm.moduleName" placeholder="请输入模块名称" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="文件及结构体前缀" field="fileName"
                                    :rules="[{ required: true, message: '文件名称不能为空' }]">
                                    <a-input v-model="editForm.fileName" placeholder="请输入文件名称" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-item label="描述" field="describe"
                                    :rules="[{ required: true, message: '描述不能为空' }]">
                                    <a-textarea v-model="editForm.describe" placeholder="请输入描述"
                                        :auto-size="{ minRows: 3 }" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-card>
                </a-tab-pane>
                <a-tab-pane key="2" title="字段信息">
                    <a-card>
                        <a-table row-key="id" :data="editForm.sysGenFields" :bordered="{ cell: true }"
                            :pagination="false" :scroll="{ x: '100%', y: 600 }">
                            <template #columns>
                                <a-table-column title="字段名" :width="150">
                                    <template #cell="{ record }">
                                        <a-input v-model="record.customName" placeholder="请输入字段名" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="字段描述" :width="200">
                                    <template #cell="{ record }">
                                        <a-input v-model="record.dataComment" placeholder="请输入字段描述" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="字段类型" :width="120">
                                    <template #cell="{ record }">
                                        {{ record.dataType }}
                                    </template>
                                </a-table-column>
                                <a-table-column title="必填" :width="50" align="center">
                                    <template #cell="{ record }">
                                        <a-checkbox :model-value="Boolean(record.require)"
                                            @update:model-value="record.require = $event ? 1 : 0" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="列表" :width="50" align="center">
                                    <template #cell="{ record }">
                                        <a-checkbox :model-value="Boolean(record.listShow)"
                                            @update:model-value="record.listShow = $event ? 1 : 0" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="表单" :width="50" align="center">
                                    <template #cell="{ record }">
                                        <a-checkbox :model-value="Boolean(record.formShow)"
                                            @update:model-value="record.formShow = $event ? 1 : 0" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="查询" :width="50" align="center">
                                    <template #cell="{ record }">
                                        <a-checkbox :model-value="Boolean(record.queryShow)"
                                            @update:model-value="record.queryShow = $event ? 1 : 0" />
                                    </template>
                                </a-table-column>
                                <a-table-column title="查询方式" :width="150">
                                    <template #cell="{ record }">
                                        <a-select v-model="record.queryType" placeholder="请选择查询方式" allow-search
                                            allow-clear>
                                            <!-- 等于 -->
                                            <a-option value="EQ">=</a-option>
                                            <!-- 不等于 -->
                                            <a-option value="NE">!=</a-option>
                                            <!-- 大于 -->
                                            <a-option value="GT">&gt;</a-option>
                                            <!-- 大于等于 -->
                                            <a-option value="GTE">&gt;=</a-option>
                                            <!-- 小于 -->
                                            <a-option value="LT">&lt;</a-option>
                                            <!-- 小于等于 -->
                                            <a-option value="LTE">&lt;=</a-option>
                                            <!-- 包含 -->
                                            <a-option value="LIKE">LIKE</a-option>
                                            <!-- 范围 -->
                                            <a-option value="BETWEEN">BETWEEN</a-option>
                                        </a-select>
                                    </template>
                                </a-table-column>
                                <a-table-column title="表单类型" :width="150">
                                    <template #cell="{ record }">
                                        <a-select v-model="record.formType" placeholder="请选择表单类型" allow-search
                                            allow-clear>
                                            <a-option value="input">文本框</a-option>
                                            <a-option value="textarea">文本域</a-option>
                                            <a-option value="number">数字输入框</a-option>
                                            <a-option value="select">下拉框</a-option>
                                            <a-option value="radio">单选框</a-option>
                                            <a-option value="checkbox">复选框</a-option>
                                            <a-option value="datetime">日期时间</a-option>
                                        </a-select>
                                    </template>
                                </a-table-column>
                                <a-table-column title="关联字典" :width="150">
                                    <template #cell="{ record }">
                                        <a-select v-model="record.dictType" placeholder="请选择字典类型" allow-search
                                            allow-clear>
                                            <a-option v-for="item in dictOption" :key="item.value" :label="item.label"
                                                :value="item.value"></a-option>
                                        </a-select>
                                    </template>
                                </a-table-column>
                            </template>
                        </a-table>
                    </a-card>
                </a-tab-pane>
            </a-tabs>
        </a-form>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    getSysGenByIdAPI,
    updateSysGenAPI,
    type SysGenItem
} from "@/api/sysgen";
import { arcoMessage } from "@/globals";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import { useSystemStore } from "@/store/modules/system";
import { storeToRefs } from "pinia";
const system = useSystemStore();
const { dict } = storeToRefs(system);
const dictOption = computed(() => {
    return dict.value.map((item: any) => ({
        label: item.name,
        value: item.code
    }));
});
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
    let info = {
        mobile: {
            width: "95%",
            layout: "vertical"
        },
        desktop: {
            width: "80%",
            layout: "horizontal"
        }
    };
    return isMobile.value ? info.mobile : info.desktop;
});
interface Props {
    visible: boolean;
    recordId?: number;
}

interface Emits {
    (e: "update:visible", value: boolean): void;
    (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    recordId: 0
});

const emit = defineEmits<Emits>();

// 抽屉可见性
const drawerVisible = ref(false);

// 标题
const title = computed(() => {
    return props.recordId ? "修改配置" : "新增配置";
});

// 加载状态
const editLoading = ref(false);

// 表单引用
const editFormRef = ref();



// 表单数据
const editForm = ref<SysGenItem>({
    id: 0,
    name: "",
    moduleName: "",
    fileName: "",
    describe: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    createdBy: 0,
    sysGenFields: []
});

// 监听可见性变化
watch(
    () => props.visible,
    async (newVal) => {
        drawerVisible.value = newVal;
        if (newVal && props.recordId) {
            await loadConfigDetail();
        }
    }
);

// 加载配置详情
const loadConfigDetail = async () => {
    if (!props.recordId) return;

    editLoading.value = true;
    try {
        const res = await getSysGenByIdAPI(props.recordId);
        if (res.data) {
            editForm.value = res.data;
        }
    } catch (error) {
        console.error("获取配置详情失败:", error);
        arcoMessage("error", "获取配置详情失败");
    } finally {
        editLoading.value = false;
    }
};

// 处理编辑提交
const handleEdit = async () => {
    const isValid = await editFormRef.value?.validate();
    if (isValid) {
        // 获取第一个错误字段的错误信息
        const firstErrorField:any = Object.values(isValid)[0];
        const errorMessage = firstErrorField?.message || "表单验证失败";
        arcoMessage("error", errorMessage);
        return false;
    }
    console.log("editForm", editForm.value)
    editLoading.value = true;
    try {
        const res = await updateSysGenAPI(editForm.value);
        if (res.code === 0) {
            arcoMessage("success", "保存成功");
            handleCancel();
            emit("update:visible", false);
            emit("success");
            return true;
        } else {
            arcoMessage("error", res.message || "保存失败");
            return false;
        }
    } catch (error) {
        console.error("保存失败:", error);
        arcoMessage("error", "保存失败");
        return false;
    } finally {
        editLoading.value = false;
    }
};

// 处理取消
const handleCancel = () => {
      emit("update:visible", false);
      // 重置表单
      editFormRef.value?.resetFields();
      editForm.value = {
        id: 0,
        name: "",
        moduleName: "",
        fileName: "",
        describe: "",
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
        createdBy: 0,
        sysGenFields: []
      };
};
</script>

<style lang="scss" scoped>
.mb-4 {
    margin-bottom: 1rem;
}
</style>