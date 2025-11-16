<template>
    <div class="snow-fill">
        <div class="snow-fill-inner container">


            <s-fold-page :width="280">
                <template #sider> 
                    <div class="left-box">
                        <a-input v-model="deptSearchKeyword" placeholder="请输入部门名称" @input="onDeptSearch" @clear="onDeptSearch"
                            allow-clear>
                            <template #prefix>
                                <icon-search />
                            </template>
                        </a-input>
                        <div class="tree-box">
                            <a-tree ref="treeRef" :field-names="fieldNames" :data="filteredTreeData" show-line
                                @select="onSelectTree">
                            </a-tree>
                        </div>
                    </div>
                </template>

                <template #content>
                    <div class="right-box">
                        <a-space wrap>
                            <a-input v-model="form.name" placeholder="请输入用户名称" allow-clear />
                            <a-input v-model="form.phone" placeholder="请输入手机号码" allow-clear />
                            <a-select placeholder="用户状态" v-model="form.status" style="width: 120px" allow-clear>
                                <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name
                                }}</a-option>
                            </a-select>
                            <a-range-picker v-model="form.createTime" show-time format="YYYY-MM-DD HH:mm" allow-clear />
                            <a-button type="primary" @click="search">
                                <template #icon><icon-search /></template>
                                <span>查询</span>
                            </a-button>
                            <a-button @click="reset">
                                <template #icon><icon-refresh /></template>
                                <span>重置</span>
                            </a-button>
                            <a-button type="primary" @click="onAdd" v-hasPerm="['system:account:add']">
                                <template #icon><icon-plus /></template>
                                <span>新增</span>
                            </a-button>
                        </a-space>

                        <a-table row-key="id" :data="accountList" :bordered="{ cell: true }" :loading="loading"
                            :scroll="{ x: '120%', y: '85%' }" :pagination="pagination" :selected-keys="selectedKeys"
                            @select="select" @select-all="selectAll" @page-change="handlePageChange">
                            <template #columns>
                                <a-table-column title="ID" data-index="id" :width="70" align="center"></a-table-column>
                                <a-table-column title="用户名称" data-index="userName" :width="150"></a-table-column>
                                <a-table-column title="昵称" data-index="nickName" :width="150"></a-table-column>
                                <a-table-column title="性别" data-index="sex" align="center" :width="60">
                                    <template #cell="{ record }">
                                        <a-tag bordered size="small" color="arcoblue" v-if="record.sex == 1">男</a-tag>
                                        <a-tag bordered size="small" color="red" v-else-if="record.sex == 0">女</a-tag>
                                        <a-tag bordered size="small" v-else>未知</a-tag>
                                    </template>
                                </a-table-column>
                                <a-table-column title="部门" data-index="deptId" :width="150">
                                    <template #cell="{ record }">{{ record.department ? record.department.name : ""
                                        }}</template>
                                </a-table-column>
                                <a-table-column title="手机号" data-index="phone" :width="150"></a-table-column>
                                <a-table-column title="状态" :width="100" align="center">
                                    <template #cell="{ record }">
                                        <a-tag bordered size="small" color="arcoblue" v-if="record.status === 1">启用</a-tag>
                                        <a-tag bordered size="small" color="red" v-else>禁用</a-tag>
                                    </template>
                                </a-table-column>
                                <a-table-column title="描述" data-index="description" :ellipsis="true"
                                    :tooltip="true" :width="150"></a-table-column>
                                <a-table-column title="创建时间" data-index="createdAt" :width="180">
                                    <template #cell="{ record }">
                                        {{ record.createdAt ? formatTime(record.createdAt) : "" }}
                                    </template>
                                </a-table-column>
                                <a-table-column title="操作" :width="200" align="center" :fixed="isMobile ? '' : 'right'">
                                    <template #cell="{ record }">
                                        <a-space>
                                            <a-link @click="onUpdate(record)" v-hasPerm="['system:account:edit']">
                                                <template #icon><icon-edit /></template>
                                                <span>修改</span>
                                            </a-link>
                                            <a-popconfirm type="warning" content="确定删除该账号吗?" @ok="onDelete(record)">
                                                <a-link status="danger" v-hasPerm="['system:account:delete']">
                                                    <template #icon><icon-delete /></template>
                                                    <span>删除</span>
                                                </a-link>
                                            </a-popconfirm>
                                        </a-space>
                                    </template>
                                </a-table-column>
                            </template>
                        </a-table>
                    </div>
                </template>
            </s-fold-page>
        </div>

        <a-modal :width="layoutMode.width" v-model:visible="open" @close="afterClose" :on-before-ok="handleOk" @cancel="afterClose">
            <template #title> {{ title }} </template>
            <div>
                <a-form ref="formRef" auto-label-width :layout="layoutMode.layout" :rules="dynamicRules" :model="addFrom">
                    <a-row>
                        <a-col :span="12">
                            <a-form-item field="userName" label="用户名称" validate-trigger="blur">
                                <a-input v-model="addFrom.userName" placeholder="请输入用户名称" allow-clear />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item field="nickName" label="昵称" validate-trigger="blur">
                                <a-input v-model="addFrom.nickName" placeholder="请输入昵称" allow-clear />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="12">
                            <a-form-item field="phone" label="手机号码" validate-trigger="blur">
                                <a-input v-model="addFrom.phone" placeholder="请输入手机号码" allow-clear />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item field="email" label="邮箱" validate-trigger="blur">
                                <a-input v-model="addFrom.email" placeholder="请输入邮箱" allow-clear />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="12" >
                            <a-form-item field="password" label="密码" validate-trigger="blur">
                                <a-input-password v-model="addFrom.password" :defaultVisibility="true"
                                    :placeholder="formType == 0 ? '请输入密码' : '输入新密码，留空则不修改'" allow-clear />
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item field="sex" label="性别" validate-trigger="blur">
                                <a-radio-group v-model="addFrom.sex" :options="sexOption">
                                    <template #label="{ data }">
                                        <div>{{ data.name }}</div>
                                    </template>
                                </a-radio-group>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-form-item field="deptId" label="所属部门" validate-trigger="blur">
                        <a-tree-select v-model="addFrom.deptId" :data="treeData" :field-names="{
                            key: 'id',
                            title: 'name',
                            children: 'children'
                        }" placeholder="请选择所属部门"></a-tree-select>
                    </a-form-item>
                    <a-form-item field="roles" label="角色" validate-trigger="blur">
                        <a-tree-select v-model="addFrom.roles" :data="roleList" :field-names="{
                            key: 'id',
                            title: 'name',
                            children: 'children'
                        }" multiple placeholder="请选择角色" />
                    </a-form-item>
                    <a-form-item field="status" label="状态" validate-trigger="blur">
                        <a-switch type="round" :checked-value="1" :unchecked-value="0" v-model="addFrom.status">
                            <template #checked> 启用 </template>
                            <template #unchecked> 禁用 </template>
                        </a-switch>
                    </a-form-item>
                    <a-form-item field="description" label="描述" validate-trigger="blur">
                        <a-textarea v-model="addFrom.description" placeholder="请输入描述" allow-clear />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { getDivisionAPI } from "@/api/department";
import { getRolesAPI } from "@/api/role";
import { getAccountListAPI, addAccountAPI, editAccountAPI, deleteAccountAPI } from "@/api/user";
import { deepClone } from "@/utils";
import { formatTime } from "@/globals";
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
  let info = {
    mobile: {
      width: "95%",
      layout: "vertical"
    },
    desktop: {
      width: "40%",
      layout: "horizontal"
    }
  };
  return isMobile.value ? info.mobile : info.desktop;
});

const openState = ref(dictFilter("status"));
const sexOption = ref(dictFilter("gender"));
const form = ref({
    name: "",
    phone: "",
    status: null,
    createTime: []
});

// 部门搜索关键字
const deptSearchKeyword = ref("");

// 选中的部门ID集合，用于过滤用户列表
const selectedDeptIds = ref<number[]>([]);

const search = () => {
    pagination.value.current = 1;
    getAccount();
};
// 添加一个标志位，用于标识是否在重置操作中
const isResetting = ref(false);
const reset = () => {
    isResetting.value = true;
    form.value = {
        name: "",
        phone: "",
        status: null,
        createTime: []
    };
    // 重置部门搜索关键字
    deptSearchKeyword.value = "";
    // 重置部门选择
    selectedDeptIds.value = [];
    // 清空树的选中状态
    if (treeRef.value) {
        treeRef.value.selectAll(false);
    }
    // 重新加载完整的部门树
    filteredTreeData.value = treeData.value;
    getAccount();
     // 延迟重置标志位，确保不会影响正常的树选择事件
    setTimeout(() => {
        isResetting.value = false;
    }, 0);
};

// 新增
const formType = ref(0); // 0新增 1修改
const open = ref(false);
    
// 基础规则
const baseRules: Record<string, any> = {
    userName: [
        {
            required: true,
            message: "请输入用户名称"
        }
    ],
    nickName: [
        {
            required: true,
            message: "请输入昵称"
        }
    ],
    sex: [
        {
            required: true,
            message: "请选择性别"
        }
    ],
    deptId: [
        {
            required: true,
            message: "请选择部门"
        }
    ],
    roles: [
        {
            required: true,
            message: "请选择角色"
        }
    ],
    status: [
        {
            required: true,
            message: "请选择状态"
        }
    ]
};

// 动态计算规则
const dynamicRules = computed(() => {
    const rules: Record<string, any> = { ...baseRules };
    
    // 根据表单类型设置密码规则
    if (formType.value === 0) {
        // 新增时密码必填
        rules.password = [
            {
                required: true,
                message: "请输入密码"
            }
        ];
    } else {
        // 编辑时密码非必填
        rules.password = [
            {
                required: false,
                message: "请输入密码"
            }
        ];
    }
    
    return rules;
});

const addFrom = ref<any>({
    userName: "",
    nickName: "",
    phone: "",
    email: "",
    password: "",
    sex: "",
    deptId: null,
    roles: [],
    status: 1,
    description: ""
});

const title = ref("");
const formRef = ref();
const onAdd = () => {
    title.value = "新增账号";
    formType.value = 0;
    open.value = true;
};
const handleOk = async () => {
    let state = await formRef.value.validate();
    if (state) return false;
    try {
        if (formType.value == 0) {
            await addAccountAPI(addFrom.value);
        } else {
            await editAccountAPI(addFrom.value);
        }
    } catch (error) {
        //console.error(error)
        return false;
    }

    arcoMessage("success", "提交成功");
    getAccount();
    return true;
};
// 关闭对话框动画结束后触发
const afterClose = () => {
    formRef.value.resetFields();
    addFrom.value = {
        userName: "",
        nickName: "",
        phone: "",
        email: "",
        password: "",
        sex: "",
        deptId: null,
        roles: [],
        status: 1,
        description: ""
    };
};
const onUpdate = (row: any) => {
    title.value = "修改账号";
    formType.value = 1;
    addFrom.value = deepClone({ ...row, roles: row.roles.map((item: any) => item.id) });
    //console.log(addFrom.value)
    open.value = true;
};

// 删除
const onDelete = async (row: any) => {
    try {
        await deleteAccountAPI({ id: row.id });
        arcoMessage("success", "删除成功");
        getAccount();
    } catch (error) { }
};



const loading = ref(false);
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showPageSize: true,
    showTotal: true,
    showJumper: true
});

// 获取用户列表
const accountList = ref();
const getAccount = async () => {
    loading.value = true;
    const params: any = {
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
        order: "id desc",
        ...form.value
    };

    // 如果有选中的部门，则添加部门ID参数用于过滤
    if (selectedDeptIds.value.length > 0) {
        params.deptIds = selectedDeptIds.value;
    }

    let { data } = await getAccountListAPI(params);
    accountList.value = data.list;
    pagination.value.total = data.total;
    loading.value = false;
};
const selectedKeys = ref([]);
const select = (list: []) => {
    selectedKeys.value = list;
};
const selectAll = (state: boolean) => {
    selectedKeys.value = state ? (accountList.value.map((el: any) => el.id) as []) : [];
};

// 分页变化事件处理
const handlePageChange = (page: number) => {
    pagination.value.current = page;
    getAccount();
};

// 部门树
const fieldNames = ref({
    key: "id",
    title: "name",
    children: "children"
});
const treeData = ref();
const filteredTreeData = ref(); // 过滤后的部门树数据
const treeRef = ref();

// 部门搜索处理函数
const onDeptSearch = () => {
    if (!deptSearchKeyword.value) {
        // 如果搜索关键字为空，显示完整的部门树
        filteredTreeData.value = treeData.value;
        return;
    }

    // 过滤部门树数据
    const filterTree = (nodes: any[]) => {
        if (!nodes || nodes.length === 0) return [];

        const result = [];
        for (const node of nodes) {
            // 检查当前节点是否匹配搜索关键字
            const isMatch = node.name.includes(deptSearchKeyword.value);

            // 递归过滤子节点
            const filteredChildren = filterTree(node.children);

            // 如果当前节点匹配或者有匹配的子节点，则保留该节点
            if (isMatch || filteredChildren.length > 0) {
                const newNode = { ...node };
                // 如果当前节点匹配，显示所有子节点
                // 如果当前节点不匹配，但子节点匹配，则只显示匹配的子节点
                newNode.children = isMatch ? node.children : filteredChildren;
                result.push(newNode);
            }
        }
        return result;
    };

    filteredTreeData.value = filterTree(treeData.value);
};

// 通过ID在树中查找节点
const findNodeById = (nodes: any[], id: number): any => {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        if (node.children && node.children.length > 0) {
            const found = findNodeById(node.children, id);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

// 递归获取节点及其所有子节点的ID
const getAllChildrenIds = (node: any): number[] => {
    let ids: number[] = [node.id];

    if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
            ids = ids.concat(getAllChildrenIds(child));
        });
    }

    return ids;
};

// 获取部门列表
const getDivision = async () => {
    let { data } = await getDivisionAPI();
    treeData.value = data.list;
    filteredTreeData.value = data.list; // 初始化过滤后的数据
    setTimeout(() => {
        treeRef.value.expandAll();
    }, 0);
};

// 部门树选择事件处理
const onSelectTree = (selectedKeys: any[]) => {
     // 如果正在重置操作中，不执行后续逻辑
    if (isResetting.value) {
        return;
    }
    // 获取选中部门及其子部门的ID集合
    if (selectedKeys.length > 0 && treeData.value) {
        // 获取选中的节点
        const selectedNodeId = selectedKeys[0];
        const selectedNode = findNodeById(treeData.value, selectedNodeId);

        if (selectedNode) {
            // 获取该节点及其所有子节点的ID
            selectedDeptIds.value = getAllChildrenIds(selectedNode);
        } else {
            selectedDeptIds.value = [];
        }
    } else {
        selectedDeptIds.value = [];
    }


    pagination.value.current = 1;
    getAccount();
};

// 角色列表
const roleList = ref<any>([]);
const getRole = async () => {
    let { data } = await getRolesAPI();
    roleList.value = data.list;
};

onMounted(() => {
    getDivision();
    getAccount();
    getRole();
});

</script>

<style lang="scss" scoped>
.container {
    display: flex;
    column-gap: $padding;

    .left-box {
        display: flex;
        flex-direction: column;
        width: 250px;
        height: 100%;
        flex-shrink: 0; // 防止被压缩

        .tree-box {
            flex: 1;
            margin-top: $padding;
            overflow: auto;
        }
    }

    .right-box {
        flex: 1;
        min-width: 0; // 防止 flex 子元素溢出
    }
}
</style>
