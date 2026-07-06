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
                                    <a-input v-model="editForm.moduleName" placeholder="请输入模块名称，支持路径如 test/admin" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="文件及结构体前缀" field="fileName"
                                    :rules="[{ required: true, message: '文件名称不能为空' }]">
                                    <a-input v-model="editForm.fileName" placeholder="请输入文件名称" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="是否覆盖" field="isCover">
                                    <a-checkbox :model-value="Boolean(editForm.isCover)"
                                        @update:model-value="editForm.isCover = $event ? 1 : 0">
                                        是否覆盖已存在的文件
                                    </a-checkbox>
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="是否生成菜单" field="isMenu">
                                    <a-checkbox :model-value="Boolean(editForm.isMenu)"
                                        @update:model-value="editForm.isMenu = $event ? 1 : 0">
                                        是否生成菜单
                                    </a-checkbox>
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="是否生成树形数据" field="isTree">
                                    <a-checkbox :model-value="Boolean(editForm.isTree)"
                                        @update:model-value="handleIsTreeChange">
                                        是否生成树形数据
                                    </a-checkbox>
                                    <template #extra>
                                        数据库中须包含id（主键）、name及parent_id字段，且parent_id与主键数据类型需一致。
                                    </template>
                                </a-form-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-item label="是否关联树形数据" field="isRelationTree">
                                    <a-checkbox :model-value="Boolean(editForm.isRelationTree)"
                                        @update:model-value="handleIsRelationTreeChange">
                                        是否关联树形数据
                                    </a-checkbox>
                                </a-form-item>
                            </a-col>
                            <a-col :span="12" v-if="editForm.isRelationTree === 1">
                                <a-form-item label="关联树形数据表" field="relationTreeTable">
                                    <a-select v-model="editForm.relationTreeTable" placeholder="请选择关联树形数据表"
                                        allow-search allow-clear>
                                        <a-option :value="0" label="请选择"></a-option>
                                        <a-option v-for="item in treeTableOptions" :key="item.id" :label="item.name"
                                            :value="item.id"></a-option>
                                    </a-select>
                                    <template #extra>
                                        请自行确保已经为所选数据表生成了树形数据模块且在同一个目录/模块中,因为前端需要调用相关的API。
                                    </template>
                                </a-form-item>
                            </a-col>
                            <a-col :span="12" v-if="editForm.isRelationTree === 1">
                                <a-form-item label="关联字段" field="relationField">
                                    <a-select v-model="editForm.relationField" placeholder="请选择关联字段" allow-search
                                        allow-clear>
                                        <a-option :value="0" label="请选择"></a-option>
                                        <a-option v-for="item in editForm.sysGenFields" :key="item.id"
                                            :label="item.customName || item.dataName" :value="item.id"></a-option>
                                    </a-select>
                                    <template #extra>
                                        关联字段需要与关联树形数据表的主键字段类型一致。
                                    </template>
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
                        <a-alert :show-icon="false"  closable style="margin-bottom: 16px;">
                            <template #close-element>
                                <icon-close-circle />
                            </template>
                            <p> 1、表单类型为"系统用户选择"或"系统部门选择"时，当字段类型为数值时是单选模式，字段类型为字符串时是多选模式。</p>   
                            <p> 2、表单类型为单图上传、多图上传、文件上传时，字段类型必须为字符串。</p>   
                        </a-alert>
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
                                <a-table-column title="字段类型" :width="100">
                                    <template #cell="{ record }">
                                        {{ record.dataType }}
                                    </template>
                                </a-table-column>
                                 <a-table-column title="GO类型" :width="100">
                                    <template #cell="{ record }">
                                        {{ record.goType }}
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
                                            <a-option value="image">单图上传</a-option>
                                            <a-option value="images">多图上传</a-option>
                                            <a-option value="richtext">富文本</a-option>
                                            <a-option value="file">文件上传</a-option>
                                            <a-option value="sysuser">系统用户选择</a-option>
                                            <a-option value="sysdep">系统部门选择</a-option>
                                             
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
import { ref, computed, watch, onMounted } from 'vue';
import {
    getSysGenByIdAPI,
    updateSysGenAPI,
    getSysGenListAPI,
    type SysGenItem,
    type SysGenListParams
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

// 树形表选项
const treeTableOptions = ref<Array<{ id: number; name: string }>>([]);

// 加载树形表列表
const loadTreeTableOptions = async () => {
    try {
        const params: SysGenListParams = {
            pageNum: 1,
            pageSize: 5000,
            isTree: 1
        };
        const res = await getSysGenListAPI(params);
        if (res.data?.list) {
            treeTableOptions.value = res.data.list
                .map((item: SysGenItem) => ({
                    id: item.id,
                    name: item.name
                }));

            //console.log("树形表列表:", treeTableOptions.value)
        }
    } catch (error) {
        console.error("获取树形表列表失败:", error);
    }
};

// 组件挂载时加载树形表选项
onMounted(() => {
    loadTreeTableOptions();
});
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
    isCover: 0,
    isMenu: 0,
    isTree: 0,
    isRelationTree: 0,
    relationTreeTable: 0,
    relationField: 0,
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

// 处理是否生成树形数据变化
const handleIsTreeChange = (value: boolean) => {
    editForm.value.isTree = value ? 1 : 0;
    // 如果勾选了生成树形数据，则取消关联树形数据
    if (value && editForm.value.isRelationTree === 1) {
        editForm.value.isRelationTree = 0;
        editForm.value.relationTreeTable = 0;
        editForm.value.relationField = 0;
    }
};

// 处理是否关联树形数据变化
const handleIsRelationTreeChange = (value: boolean) => {
    editForm.value.isRelationTree = value ? 1 : 0;
    // 如果勾选了关联树形数据，则取消生成树形数据
    if (value && editForm.value.isTree === 1) {
        editForm.value.isTree = 0;
    }
    // 如果取消关联树形数据，清空关联表和关联字段
    if (!value) {
        editForm.value.relationTreeTable = 0;
        editForm.value.relationField = 0;
    }
};

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
    //console.log("editForm", editForm.value)
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
        isCover: 0,
        isMenu: 0,
        isTree: 0,
        isRelationTree: 0,
        relationTreeTable: 0,
        relationField: 0,
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