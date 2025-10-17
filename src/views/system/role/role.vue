<template>
    <div class="snow-page">
        <div class="snow-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.name" placeholder="请输入角色名称" allow-clear />
                        <a-select placeholder="角色状态" v-model="form.status" style="width: 120px" allow-clear>
                            <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name
                                }}</a-option>
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
                </template>
                <template #right>
                    <a-space wrap>
                        <a-button type="primary" @click="onAdd" v-hasPerm="['system:role:add']">
                            <template #icon><icon-plus /></template>
                            <span>新增</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>
            <a-table row-key="id" :data="displayRoleList" :bordered="{ cell: true }" :loading="loading"
                :pagination="false" :scroll="{ x: '100%', y: '100%', minWidth: 1000 }">
                <template #columns>
                    <a-table-column title="角色名称" data-index="name"></a-table-column>
                    <a-table-column title="ID" data-index="id" :width="70"></a-table-column>
                    <a-table-column title="排序" data-index="sort" :width="100" align="center"></a-table-column>
                    <a-table-column title="状态" :width="100" align="center">
                        <template #cell="{ record }">
                            <a-tag bordered size="small" color="arcoblue" v-if="record.status === 1">启用</a-tag>
                            <a-tag bordered size="small" color="red" v-else>禁用</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="描述" data-index="description" :ellipsis="true"
                        :tooltip="true"></a-table-column>
                    <a-table-column title="创建时间" data-index="createdAt" :width="180">
                        <template #cell="{ record }">{{ record.createdAt ? formatTime(record.createdAt) : ""
                            }}</template>
                    </a-table-column>
                    <a-table-column title="操作" :width="350" align="center" :fixed="'right'">
                        <template #cell="{ record }">
                            <a-space size="mini">
                                <a-link v-hasPerm="['system:role:addRoleMenu']" status="warning"
                                    @click="onPrivileges(record)">
                                    分配权限
                                </a-link>
                                <a-link @click="onDataScope(record)" status="warning"
                                    v-hasPerm="['system:role:dataScope']">
                                    数据权限
                                </a-link>
                                <a-link v-hasPerm="['system:role:add']" @click="onAddChild(record)">
                                    <template #icon><icon-plus /></template>
                                    新增
                                </a-link>
                                <a-link v-hasPerm="['system:role:edit']" @click="onUpdate(record)">
                                    <template #icon><icon-edit /></template>
                                    修改
                                </a-link>
                                <a-popconfirm type="warning" content="确定删除该角色吗?" @ok="onDelete(record)">
                                    <a-link v-hasPerm="['system:role:delete']" status="danger">
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

        <a-modal width="40%" v-model:visible="open" @close="afterClose" :on-before-ok="handleOk" @cancel="afterClose">
            <template #title> {{ title }} </template>
            <div>
                <a-form ref="formRef" auto-label-width :rules="rules" :model="addFrom">
                    <a-form-item field="parentId" label="父级角色" validate-trigger="blur">
                        <a-tree-select v-model="addFrom.parentId" :data="flattenRoleList" placeholder="请选择父级角色"
                            allow-clear allow-search :field-names="{
                                key: 'id',
                                title: 'name',
                                children: 'children'
                            }" />
                    </a-form-item>

                    <a-form-item field="name" label="角色名称" validate-trigger="blur">
                        <a-input v-model="addFrom.name" placeholder="请输入角色名称" allow-clear />
                    </a-form-item>

                    <a-form-item field="status" label="状态" validate-trigger="blur">
                        <a-switch type="round" :checked-value="1" :unchecked-value="0" v-model="addFrom.status">
                            <template #checked> 启用 </template>
                            <template #unchecked> 禁用 </template>
                        </a-switch>
                    </a-form-item>
                    <a-form-item field="sort" label="排序" validate-trigger="blur">
                        <a-input-number v-model="addFrom.sort" :step="1" :precision="0" :min="1" :max="9999"
                            :style="{ width: '150px' }" placeholder="请输入" mode="button" class="input-demo" />
                    </a-form-item>
                    <a-form-item field="description" label="描述" validate-trigger="blur">
                        <a-textarea v-model="addFrom.description" placeholder="请输入描述" allow-clear />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>

        <a-drawer :visible="drawerOpen" :width="500" @ok="drawerOk" @cancel="drawerCancel">
            <template #title> 分配权限 </template>
            <div>
                <a-card>
                    <a-row :gutter="24" justify="center">
                        <a-col :span="8">
                            <span class="text-right-gap">展开全部</span>
                            <a-switch type="round" v-model="treeSwitch.expandAll" @change="onExpandAll">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </a-switch>
                        </a-col>
                        <a-col :span="8">
                            <span class="text-right-gap">全选节点</span>
                            <a-switch type="round" v-model="treeSwitch.selectAll" @change="onSelectAll">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </a-switch>
                        </a-col>
                        <a-col :span="8">
                            <a-tooltip content="权限树的父子节点独立，因为若节点关联，父节点会存在半选情况，半选节点的ID不会返回，会导致菜单无法渲染">
                                <span>父子关联 <icon-question-circle-fill /></span>
                            </a-tooltip>
                        </a-col>
                    </a-row>
                </a-card>

                <a-tree ref="treeRef" :fieldNames="{
                    key: 'id',
                    title: 'i18n',
                    children: 'children'
                }" :check-strictly="true" :checkable="true" :show-line="true" :unmount-on-close="true"
                    v-model:checked-keys="permissionKeys" :data="permissionTree" />
            </div>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { type ConvertedRouteItem, getMenuListAPI, convertMenuItemsToRoutes } from "@/api/menu";
import {
    type RoleItem,
    getRolesAPI,
    getUserPermissionAPI,
    addRoleMenuAPI,
    addRoleAPI,
    editRoleAPI,
    deleteRoleAPI,
    editDataScopeAPI
} from "@/api/role";
import { deepClone } from "@/utils";
import useGlobalProperties from "@/hooks/useGlobalProperties";
import { formatTime } from "@/globals";

import DataScope from "@/views/system/role/components/datascope.vue";
import { Modal } from '@arco-design/web-vue';
const proxy = useGlobalProperties();
const openState = ref(dictFilter("status"));
const form = ref({
    name: "",
    status: null
});

// 存储所有角色数据
const allRoleList = ref<RoleItem[]>([]);
// 显示的角色数据（经过筛选）
const displayRoleList = ref<RoleItem[]>([]);

// 查询功能 - 在前端完成筛选，递归查找
const search = () => {
    const nameFilter = form.value.name?.trim();
    const statusFilter = form.value.status ? Number(form.value.status) : null;
    // 如果没有筛选条件，显示所有数据
    if (!nameFilter && statusFilter === null) {
        displayRoleList.value = [...allRoleList.value];
        return;
    }

    // 递归查找符合条件的节点
    const recursiveFilter = (roles: RoleItem[]): RoleItem[] => {
        const result: RoleItem[] = [];
        for (const role of roles) {
            // 检查当前节点是否符合条件
            const nameMatch = !nameFilter || role.name.includes(nameFilter);
            const statusMatch = statusFilter === null || role.status === statusFilter;
            // 如果当前节点符合条件，添加到结果中，并继续处理子节点
            if (nameMatch && statusMatch) {
                const filteredRole = { ...role };
                if (role.children && role.children.length > 0) {
                    // 递归处理子节点
                    filteredRole.children = recursiveFilter(role.children);
                }
                result.push(filteredRole);
            } else if (role.children && role.children.length > 0) {
                // 如果当前节点不符合条件，但有子节点，递归检查子节点
                const filteredChildren = recursiveFilter(role.children);
                if (filteredChildren.length > 0) {
                    // 如果子节点中有符合条件的，将当前节点和符合条件的子节点加入结果
                    const filteredRole = { ...role, children: filteredChildren };
                    result.push(filteredRole);
                }
            }
        }
        return result;
    };

    // 应用递归筛选
    displayRoleList.value = recursiveFilter(allRoleList.value);
};

const reset = () => {
    form.value = {
        name: "",
        status: null
    };
    // 重置后显示所有数据
    displayRoleList.value = [...allRoleList.value];
};

// 新增
const open = ref(false);
const rules = {
    name: [{ required: true, message: "请输入角色名称" }],

    status: [{ required: true, message: "请选择状态" }]
};
const addFrom = ref<any>({
    name: "",
    status: 1,
    sort: 1,
    description: "",
    parentId: null
});
const formType = ref(0); // 0新增 1修改
const title = ref("");
const formRef = ref();
const onAdd = () => {
    formType.value = 0;
    title.value = "新增角色";
    open.value = true;
};

// 新增子角色
const onAddChild = (record: RoleItem) => {
    formType.value = 0;
    title.value = "新增子角色";
    // 设置父级角色为当前选中的角色
    addFrom.value.parentId = record.id;
    open.value = true;
};

// 添加角色
const handleOk = async () => {
    let state = await formRef.value.validate();
    if (state) return false; // 校验不通过

    try {
        if (formType.value == 0) {
            await addRoleAPI(addFrom.value);
        } else {
            await editRoleAPI(addFrom.value);
        }
    } catch (error) {
        return false;
    }

    arcoMessage("success", "提交成功");
    getRole();
    return true;
};
// 关闭对话框动画结束后触发
const afterClose = () => {
    formRef.value.resetFields();
    addFrom.value = {
        name: "",
        status: 1,
        sort: 1,
        description: "",
        parentId: null
    };
};
// 修改角色
const onUpdate = (row: any) => {
    formType.value = 1;
    title.value = "修改角色";
    const clonedRow = deepClone(row);
    addFrom.value = clonedRow;
    open.value = true;
};

// 获取角色列表
const loading = ref(false);
const getRole = async () => {
    try {
        loading.value = true;
        let res = await getRolesAPI();
        allRoleList.value = res.data.list;
        // 初始化显示所有数据
        displayRoleList.value = [...allRoleList.value];
    } finally {
        loading.value = false;
    }
};

// 扁平化角色列表，用于树形选择
const flattenRoleList = computed(() => {
    const flatten = (roles: RoleItem[]): any[] => {
        let result: any[] = [];
        roles.forEach(role => {
            // 在编辑时，排除自己和自己的子节点，避免循环引用
            if (addFrom.value.id && role.id === addFrom.value.id) {
                return;
            }
            result.push({
                id: role.id,
                name: role.name,
                children: role.children ? flatten(role.children) : undefined
            });
        });
        return result;
    };
    return flatten(displayRoleList.value);
});

// 获取权限树
const treeRef = ref();
const treeSwitch = ref({
    expandAll: true, // 展开全部
    selectAll: false // 全选
});
// 展开全部
const onExpandAll = (state: boolean) => {
    treeRef.value.expandAll(state);
};
// 全选
const onSelectAll = (state: boolean) => {
    treeRef.value.checkAll(state);
};

// 重置节点操作开关
const treeSwitchReset = () => {
    treeSwitch.value = {
        expandAll: true, // 固定
        selectAll: false // 全选
    };
};
const permissionTree = ref<ConvertedRouteItem[]>([]);
const permissionKeys = ref<number[]>([]);
// 获取分配权限用菜单列表
const getMenuList = async () => {
    let { data } = await getMenuListAPI();
    let menuList = convertMenuItemsToRoutes(data);
    translation(menuList);
    permissionTree.value = menuList;
};

// 开始分配权限
const currentRow = ref<any>(null);
const drawerOpen = ref(false);
const onPrivileges = async (row: any) => {
    // 更具角色ID获取有权限的菜单数据
    let res = await getUserPermissionAPI(row.id);
    permissionKeys.value = res.data.list;
    drawerOpen.value = true;
    treeRef.value.expandAll(true);
    currentRow.value = row;
};

// 分配权限提交
const drawerOk = async () => {
    await addRoleMenuAPI(currentRow.value.id, permissionKeys.value);
    drawerOpen.value = false;
    treeSwitchReset();
    arcoMessage("success", "提交成功");
    currentRow.value = null;
    //getRole();
};
const drawerCancel = () => {
    drawerOpen.value = false;
    treeSwitchReset();
};

// 语言转化
const translation = (tree: any) => {
    tree.forEach((item: any) => {
        if (item.children) translation(item.children);
        if (item.meta.title) {
            item.i18n = proxy.$t(`menu.${item.meta.title}`);
        }
    });
};

// 删除
const onDelete = async (row: any) => {
    try {
        await deleteRoleAPI({ id: row.id });
        getRole();
        arcoMessage("success", "删除成功");
    } catch (error) {
        console.error(error);
    }
};

// 数据权限
const onDataScope = (row: any) => {
    //console.log(row)
    // 正确地定义DataScope组件的引用类型
    const dataScopeRef = ref<InstanceType<typeof DataScope> | null>(null)
    Modal.confirm({
        title: "数据权限",
        width: "500px",
        content: () => h(DataScope, {
            ref: dataScopeRef,
            title: row.name,
            defaultCheckedKeys: row.checkedDepts.split(',').map(Number),
            dataScope: row.dataScope ? String(row.dataScope) : '',
            'onUpdate:checkedKeys': (data: any) => {
                console.log(data)
            }
        }),
        onBeforeOk: async () => {
            // 这里可以添加其他确认前的逻辑
            if (dataScopeRef.value) {
                const formData = dataScopeRef.value.getFormData()
                //console.log(formData)
                if (!formData.dataScope || (formData.dataScope === '2' && formData.checkedKeys.length === 0)) {
                    arcoMessage("error", "请选择权限范围");
                    return false;
                }
                //console.log(formData)
                try {
                    await editDataScopeAPI({
                        id: row.id,
                        dataScope: Number(formData.dataScope),
                        checkedDepts: formData.checkedKeys.join(",")
                    })
                    arcoMessage("success", "修改成功");
                    getRole();
                    return true;
                } catch (error) { }

            }
            return false;
        }
    })
}


getRole();
getMenuList();
</script>
