<template>
    <div class="snow-fill">
        <div class="snow-fill-inner">
            <s-layout-tools>
                <template #left>
                    <a-space wrap>
                        <a-input v-model="form.id" placeholder="请输入菜单ID" allow-clear />
                        <a-input v-model="form.name" placeholder="请输入菜单名称" allow-clear />
                        <a-input v-model="form.path" placeholder="路由路径" allow-clear />
                        <a-input v-model="form.permission" placeholder="权限标识" allow-clear />
                        <a-select v-model="form.hide" placeholder="请选择显示状态" allow-clear style="width: 120px">
                            <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name
                            }}</a-option>
                        </a-select>
                        <a-select v-model="form.disable" placeholder="请选择启用状态" allow-clear style="width: 120px">
                            <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name
                            }}</a-option>
                        </a-select>
                        <a-button type="primary" @click="performSearch">
                            <template #icon><icon-search /></template>
                            <span>查询</span>
                        </a-button>

                        <a-button @click="onReset">
                            <template #icon>
                                <icon-refresh />
                            </template>
                            <template #default>重置</template>
                        </a-button>
                    </a-space>
                </template>
                <template #right>
                    <a-space wrap>
                        <a-button type="primary" @click="onAdd" v-hasPerm="['system:menu:add']">
                            <template #icon><icon-plus /></template>
                            <span>新增</span>
                        </a-button>
                        <a-button type="primary" status="success" @click="onExpand">
                            <template #icon>
                                <icon-swap />
                            </template>
                            <span>{{ expand ? "收起" : "展开" }}</span>
                        </a-button>

                        <a-button type="primary" @click="onExport" v-hasPerm="['system:menu:export']">
                            <template #icon><icon-export /></template>
                            <span>导出</span>
                        </a-button>

                        <a-button type="outline" status="success" @click="onImport" v-hasPerm="['system:menu:import']">
                            <template #icon><icon-import /></template>
                            <span>导入</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>
            <!-- 修改表格数据源为displayMenuList -->
            <a-table ref="tableRef" :data="displayMenuList" :loading="loading" row-key="id" column-resizable
                :row-selection="{ type: 'checkbox', showCheckedAll: true }" v-model:selectedKeys="selectedKeys"
                :bordered="{ cell: true }" show-empty-tree :pagination="false" size="medium"
                :scroll="{ x: '100%', y: '85%' }">
                <template #columns>
                    <a-table-column title="菜单名称" :width="150" tooltip ellipsis>
                        <template #cell="{ record }">
                            <a-space>
                                <div>{{ $t(`menu.${record.title}`) }}</div>
                                <a-badge v-if="record.apis && record.apis.length > 0" :count="record.apis.length"
                                    :max-count="99"></a-badge>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="ID" data-index="id" :width="75" tooltip ellipsis></a-table-column>
                    <a-table-column title="类型" align="center" :width="70">
                        <template #cell="{ record }">
                            <a-tag v-if="record.type == 1" bordered size="small" color="purple">目录</a-tag>
                            <a-tag v-else-if="record.type == 2" bordered size="small" color="green">菜单</a-tag>
                            <a-tag v-else bordered size="small" color="gray">按钮</a-tag>
                        </template>
                    </a-table-column>
                    <!-- <a-table-column title="图标" align="center" :width="50">
            <template #cell="{ record }">
              <MenuItemIcon :svg-icon="record.svgIcon" :icon="record.icon" />
            </template>
          </a-table-column> -->
                    <a-table-column title="路由路径" data-index="path" :width="150" tooltip ellipsis></a-table-column>
                    <a-table-column title="路由名称" data-index="name" :width="100" tooltip ellipsis></a-table-column>
                    <a-table-column title="组件路径" :width="150" tooltip ellipsis>
                        <template #cell="{ record }">
                            {{ record.redirect ? record.redirect : record.component }}
                        </template>
                    </a-table-column>
                    <a-table-column title="权限标识" tooltip :width="150" ellipsis>
                        <template #cell="{ record }">
                            {{ record.permission }}
                        </template>
                    </a-table-column>
                    <a-table-column title="排序" align="center" :width="80">
                        <template #cell="{ record }">
                            {{ record.sort }}
                        </template>
                    </a-table-column>
                    <a-table-column title="是否隐藏" align="center" :width="100">
                        <template #cell="{ record }">
                            <a-space>
                                <a-tag bordered size="small" color="arcoblue" v-if="record.hide">是</a-tag>
                                <a-tag bordered size="small" color="red" v-else>否</a-tag>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="是否禁用" align="center" :width="100">
                        <template #cell="{ record }">
                            <a-space>
                                <a-tag bordered size="small" color="arcoblue" v-if="record.disable">是</a-tag>
                                <a-tag bordered size="small" color="red" v-else>否</a-tag>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="是否缓存" align="center" :width="100">
                        <template #cell="{ record }">
                            <a-space>
                                <a-tag bordered size="small" color="arcoblue" v-if="record.keepAlive">是</a-tag>
                                <a-tag bordered size="small" color="red" v-else>否</a-tag>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="是否外链" align="center" :width="100">
                        <template #cell="{ record }">
                            <a-space>
                                <a-tag bordered size="small" color="arcoblue" v-if="record.link">是</a-tag>
                                <a-tag bordered size="small" color="red" v-else>否</a-tag>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="是否全屏" align="center" :width="100">
                        <template #cell="{ record }">
                            <a-space>
                                <a-tag bordered size="small" color="arcoblue" v-if="record.isFull">是</a-tag>
                                <a-tag bordered size="small" color="red" v-else>否</a-tag>
                            </a-space>
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" align="center" :width="280"  :fixed="isMobile ? '' : 'right'">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link status="warning" @click="onAssignApi(record)"
                                    v-hasPerm="['system:menu:setMenuApis']">
                                    <span>API权限</span>
                                </a-link>
                                <a-link v-if="record.type != 3" @click="onCurrentAdd(record)"
                                    v-hasPerm="['system:menu:add']">
                                    <template #icon><icon-plus /></template>
                                    <span>新增</span>
                                </a-link>
                                <a-link @click="onUpdate(record)" v-hasPerm="['system:menu:edit']">
                                    <template #icon><icon-edit /></template>
                                    <span>修改</span>
                                </a-link>
                                <a-popconfirm type="warning" content="确定删除该项吗?" @ok="onDelete(record)">
                                    <a-link status="danger" v-hasPerm="['system:menu:delete']">
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

        <a-modal :width="layoutMode.width" v-model:visible="open" draggable @close="afterClose" :on-before-ok="handleOk"
            @cancel="afterClose">
            <template #title> {{ title }} </template>
            <div>
                <a-form ref="formRef" :layout="layoutMode.layout" auto-label-width :rules="rules" :model="addFrom">
                    <a-form-item field="type" label="菜单类型" validate-trigger="blur">
                        <a-radio-group type="button" :disabled="!!addFrom.id" v-model="addFrom.type"
                            @change="typeChange">
                            <a-radio v-for="item in menuType" :key="item.value" :value="item.value">{{ item.name
                            }}</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item field="parentId" label="上级菜单" validate-trigger="blur" >
                        <a-tree-select v-model="addFrom.parentId" :data="menuTree" :field-names="{
                            key: 'id',
                            title: 'i18n',
                            children: 'children'
                        }" allow-clear placeholder="请选择上级菜单"></a-tree-select>
                        <template #extra>
                            <div>未选择则默认第一级</div>
                        </template>
                    </a-form-item>
                    <a-row :gutter="24" v-if="[1, 2].includes(addFrom.type)">
                        <a-col :span="12">
                            <a-form-item field="svgIcon" label="自定义图标" validate-trigger="blur">
                                <s-select-icon type="svg" v-model="addFrom.svgIcon" />
                                <template #extra>
                                    <div>自定义图标优先级高于菜单图标</div>
                                </template>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item field="icon" label="菜单图标" validate-trigger="blur">
                                <s-select-icon type="arco" v-model="addFrom.icon" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-form-item field="title" label="菜单标题" validate-trigger="blur">
                        <a-input v-model="addFrom.title" placeholder="请输入菜单标题" allow-clear
                            @input="(e: string) => onTrim(e, 'title')" />
                        <template #extra>
                            <div>
                                优先匹配国际化Key
                                <a-typography-text code v-if="addFrom.title"> menu.{{ addFrom.title }}
                                </a-typography-text>
                                （无对应Key则直接取标题展示）
                            </div>
                        </template>
                    </a-form-item>
                    <a-form-item v-if="[1, 2].includes(addFrom.type)" field="path" label="路由路径" validate-trigger="blur">
                        <a-input v-model="addFrom.path" placeholder="请输入路由路径，如：/home" allow-clear @input="pathChange" />
                        <template #extra>
                            <div>
                                菜单名称由路径自动生成
                                <a-typography-text code v-if="addFrom.name"> {{ addFrom.name }} </a-typography-text>
                            </div>
                        </template>
                    </a-form-item>
                    <a-form-item v-if="addFrom.type == 3" field="permission" label="权限标识" validate-trigger="blur">
                        <a-input v-model="addFrom.permission" placeholder="请输入权限标识，如：sys:btn:add" allow-clear
                            @input="(e: string) => onTrim(e, 'permission')" />
                    </a-form-item>

                    <a-form-item v-if="[1, 2].includes(addFrom.type)" field="redirect" label="路由重定向"
                        validate-trigger="blur">
                        <a-input v-model="addFrom.redirect" placeholder="请输入路由重定向" allow-clear
                            @input="(e: string) => onTrim(e, 'redirect')" />
                    </a-form-item>
                    <a-form-item v-if="addFrom.type == 2" field="component" label="组件路径" validate-trigger="blur"
                        :disabled="!!addFrom.isLink">
                        <a-input v-model="addFrom.component" placeholder="请输入组件路径" allow-clear
                            @input="(e: string) => onTrim(e, 'component')">
                            <template #prepend>@/views/</template>
                            <template #append>.vue</template>
                        </a-input>
                    </a-form-item>
                    <a-row :gutter="24">
                        <a-col :span="8" v-if="[1, 2].includes(addFrom.type)">
                            <a-form-item field="hide" label="显示状态" validate-trigger="blur">
                                <a-switch type="round" v-model="addFrom.hide" :checked-value="false"
                                    :unchecked-value="true">
                                    <template #checked> 显示 </template>
                                    <template #unchecked> 隐藏 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                        <a-col :span="8" v-if="[1, 2].includes(addFrom.type)">
                            <a-form-item field="disable" label="启用状态" validate-trigger="blur">
                                <a-switch type="round" v-model="addFrom.disable" :checked-value="false"
                                    :unchecked-value="true">
                                    <template #checked> 启用 </template>
                                    <template #unchecked> 禁用 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                        <a-col :span="8" v-if="addFrom.type == 2">
                            <a-form-item field="keepAlive" label="是否缓存" validate-trigger="blur">
                                <a-switch type="round" v-model="addFrom.keepAlive">
                                    <template #checked> 是 </template>
                                    <template #unchecked> 否 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="24" v-if="addFrom.type == 2">
                        <a-col :span="8">
                            <a-form-item field="affix" label="固定Tabs" validate-trigger="blur">
                                <a-switch type="round" v-model="addFrom.affix">
                                    <template #checked> 是 </template>
                                    <template #unchecked> 否 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                        <a-col :span="8">
                            <a-form-item field="isLink" label="是否外链" validate-trigger="blur">
                                <a-switch type="round" v-model="addFrom.isLink" @change="onIsLink">
                                    <template #checked> 是 </template>
                                    <template #unchecked> 否 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                        <a-col :span="8">
                            <a-form-item field="iframe" label="内嵌窗口" validate-trigger="blur"
                                :disabled="!addFrom.isLink">
                                <a-switch type="round" v-model="addFrom.iframe" @change="onIframe">
                                    <template #checked> 是 </template>
                                    <template #unchecked> 否 </template>
                                </a-switch>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-form-item field="link" label="外链路径" validate-trigger="blur"
                        v-if="addFrom.type == 2 && addFrom.isLink">
                        <a-input v-model="addFrom.link" placeholder="请输入路由路径" allow-clear />
                    </a-form-item>
                    <a-form-item field="affix" label="全屏显示" validate-trigger="blur" v-if="addFrom.type == 2">
                        <a-switch type="round" v-model="addFrom.isFull">
                            <template #checked> 是 </template>
                            <template #unchecked> 否 </template>
                        </a-switch>
                    </a-form-item>
                    <a-form-item field="sort" label="排序" validate-trigger="blur">
                        <a-input-number v-model="addFrom.sort" :step="1" :precision="0" :min="0" :max="9999"
                            :style="{ width: '120px' }" placeholder="请输入" mode="button" class="input-demo" />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>

        <!-- API权限分配组件 -->
        <s-api-permission v-model:visible="apiPermissionVisible" :menu-id="currentMenuRecord?.id"
            :menu-name="currentMenuRecord?.title" @success="onApiPermissionSuccess"
            :showSelected="currentMenuRecord?.apis?.length > 0" />
    </div>
</template>

<script setup lang="ts">
import SApiPermission from "@/components/s-api-permission/index.vue";
import { type MenuItem, getMenuListAPI, addMenuAPI, updateMenuAPI, deleteMenuAPI, exportMenuAPI, importMenuAPI } from "@/api/menu";
import useGlobalProperties from "@/hooks/useGlobalProperties";
import { deepClone, getPascalCase } from "@/utils";
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



const proxy = useGlobalProperties();
const openState = ref(dictFilter("status"));
const form = ref({
    id: "",
    name: "",
    hide: "",
    disable: "",
    path: "",
    permission: ""
});
const selectedKeys = ref<number[]>([]);
// 存储所有菜单数据
const allMenuList = ref<MenuItem[]>([]);
// 显示的菜单数据（经过筛选）
const displayMenuList = ref<MenuItem[]>([]);

// 查询功能 - 在前端完成筛选，递归查找
const performSearch = () => {
    const idFilter = form.value.id?.trim();
    const nameFilter = form.value.name?.trim();
    const pathFilter = form.value.path?.trim();
    const permissionFilter = form.value.permission?.trim();
    const hideFilter = form.value.hide !== "" ? form.value.hide : null;
    const disableFilter = form.value.disable !== "" ? form.value.disable : null;

    // 如果没有筛选条件，显示所有数据
    if (!idFilter && !nameFilter && !pathFilter && !permissionFilter && hideFilter === null && disableFilter === null) {
        displayMenuList.value = [...allMenuList.value];
        // 重新展开/收起状态
        tableRef.value.expandAll(expand.value);
        return;
    }

    // 递归查找符合条件的节点
    const recursiveFilter = (menus: MenuItem[]): MenuItem[] => {
        const result: MenuItem[] = [];
        for (const menu of menus) {
            // 检查当前节点是否符合条件
            const idMatch = !idFilter || (menu.id && menu.id.toString().includes(idFilter));
            const nameMatch = !nameFilter || (menu.title && menu.title.includes(nameFilter));
            const pathMatch = !pathFilter || (menu.path && menu.path.includes(pathFilter));
            const permissionMatch = !permissionFilter || (menu.permission && menu.permission.includes(permissionFilter));
            // 注意：hide和disable在后端API返回的数据中是boolean类型，但在表单中是字符串类型，需要转换
            const hideMatch = hideFilter === null ||
                (hideFilter === "false" && menu.hide === false) ||
                (hideFilter === "true" && menu.hide === true);
            const disableMatch = disableFilter === null ||
                (disableFilter === "false" && menu.disable === false) ||
                (disableFilter === "true" && menu.disable === true);
            // 如果当前节点符合条件，添加到结果中，并继续处理子节点
            if (idMatch && nameMatch && pathMatch && permissionMatch && hideMatch && disableMatch) {
                const filteredMenu = { ...menu };
                if (filteredMenu.children && filteredMenu.children.length > 0) {
                    // 递归处理子节点
                    filteredMenu.children = recursiveFilter(filteredMenu.children);
                }
                result.push(filteredMenu);
            } else if (menu.children && menu.children.length > 0) {
                // 如果当前节点不符合条件，但有子节点，递归检查子节点
                const filteredChildren = recursiveFilter(menu.children);
                if (filteredChildren.length > 0) {
                    // 如果子节点中有符合条件的，将当前节点和符合条件的子节点加入结果
                    const filteredMenu = { ...menu, children: filteredChildren };
                    result.push(filteredMenu);
                }
            }
        }
        return result;
    };

    // 应用递归筛选
    displayMenuList.value = recursiveFilter(allMenuList.value);
    // 重新展开/收起状态
    tableRef.value.expandAll(expand.value);
};


// 重置查询条件
const onReset = () => {
    form.value = { id: "", name: "", hide: "", disable: "", path: "", permission: "" };
    // 重置后显示所有数据
    displayMenuList.value = [...allMenuList.value];
    // 重新展开/收起状态
    tableRef.value.expandAll(expand.value);
};

// 新增
const open = ref(false);
const rules = ref({
    parentId: [{ required: false, message: "请选择上级菜单" }],
    name: [{ required: true, message: "请输入菜单名称" }],
    title: [{ required: true, message: "请输入菜单标题" }],
    path: [{ required: true, message: "请输入路由路径" }],
    permission: [{ required: true, message: "请输入权限标识" }]
});

const menuType = ref([
    { name: "目录", value: 1 },
    { name: "菜单", value: 2 },
    { name: "按钮", value: 3 }
]);
const addFrom = ref<any>({
    type: 1,
    parentId: undefined,
    svgIcon: "",
    icon: "",
    name: "",
    title: "",
    isFull: false,
    permission: "",
    path: "",
    redirect: "",
    component: "",
    hide: false,
    disable: false,
    keepAlive: true,
    affix: false,
    isLink: false,
    link: "",
    iframe: false,
    sort: 1
});

const title = ref("");
const formRef = ref();

// 新增菜单
const onAdd = () => {
    title.value = "新增菜单";

    addFrom.value.id = 0;
    open.value = true;
};
const handleOk = async () => {
    let state = await formRef.value.validate();
    if (state) return false;
    //console.log("addFrom.value", addFrom.value);
    try {
        if (!addFrom.value.id) {
            await addMenuAPI(addFrom.value);
        } else {
            await updateMenuAPI(addFrom.value);
        }
        arcoMessage("success", "提交成功");
        getMenuList();
        return true;
    } catch (error) {
        console.error(error);
    }

    return false;
};
// 关闭对话框动画结束后触发
const afterClose = () => {
    formRef.value.resetFields();
    addFrom.value = {
        type: 1,
        parentId: undefined,
        svgIcon: "",
        icon: "",
        name: "",
        title: "",
        isFull: false,
        permission: "",
        path: "",
        redirect: "",
        component: "",
        hide: false,
        disable: false,
        keepAlive: true,
        affix: false,
        isLink: false,
        link: "",
        iframe: false,
        sort: 1
    };
};
// 修改
const onUpdate = (row: any) => {
    let data = deepClone(row);
    //console.log(JSON.stringify(data))
    delete data.children;
    if (data.parentId == 0) data.parentId = undefined;
    typeChange(data.type);
    //console.log(JSON.stringify(data))
    addFrom.value = data;
    title.value = "修改菜单";

    open.value = true;
};

// 新增子菜单
const onCurrentAdd = (record: any) => {
    let { id, type } = record;
    addFrom.value.id = 0;
    addFrom.value.parentId = id;
    addFrom.value.type = type == 2 ? 3 : type;
    title.value = "新增子菜单";
    open.value = true;
};

// 菜单类型
const typeChange = (val: number) => {
    rules.value.parentId[0].required = val == 3;
    formRef.value.clearValidate();
};

// 去除空格
const onTrim = (val: string, key: string) => {
    addFrom.value[key] = val.trim();
};

// 菜单名称
const pathChange = (str: string) => {
    addFrom.value.path = str.trim();
    addFrom.value.name = getPascalCase(str.trim().replace(/[./:?=&"-]/g, "_"));
};

// 是否外链
const onIsLink = (is: boolean) => {
    // 非外链
    if (!is) {
        // 关联iframe和link
        addFrom.value.iframe = false;
        addFrom.value.link = "";
        addFrom.value.component = "";
    } else {
        // 外链
        addFrom.value.component = "link/external/external";
    }
};

// 是否内嵌外链窗口
const onIframe = (is: boolean) => {
    // 非内嵌
    if (!is) {
        // 关联iframe和link
        addFrom.value.component = "link/external/external";
    } else {
        // 内嵌
        addFrom.value.component = "link/internal/internal";
    }
};

const loading = ref(false);
const tableRef = ref();
const menuTree = ref<any>([]);
const getMenuList = async () => {
    try {
        loading.value = true;
        let { data } = await getMenuListAPI();
        // 语言翻译
        translation(data);
        // 存储所有数据
        allMenuList.value = data;
        // 初始化显示所有数据
        displayMenuList.value = [...allMenuList.value];
        // 过滤type:3的节点，该节点是按钮权限，不显示在菜单中-用于下拉选择
        menuTree.value = filterTree(data);
    } finally {
        loading.value = false;
    }
};

const expand = ref(false);
const onExpand = () => {
    expand.value = !expand.value;
    tableRef.value.expandAll(expand.value);
};

// 语言转化
const translation = (tree: any[]) => {
    tree.forEach((item: any) => {
        if (item.children) translation(item.children);
        if (item.title) {
            item.i18n = proxy.$t(`menu.${item.title}`);
        }
    });
};

/**
 *
 * 过滤type:3的节点，该节点是按钮权限，不显示在菜单中-用于下拉选择
 * @param {object} nodes 路由树
 * @returns 节点过滤后的路由树
 */
//const  filterTree = (nodes: Menu.MenuOptions[]) => {
const filterTree = (nodes: MenuItem[]) => {
    // 过滤当前层级的节点，排除 type 为 3 的节点
    return nodes
        .filter((node: any) => node.type !== 3)
        .map((node: any) => {
            // 创建新节点以避免修改原数据
            const newNode = { ...node };
            // 删除 icon 字段以避免传递给 a-tree-select 组件，因为 a-tree-select 期望 icon 是函数类型
            // 而我们的数据中 icon 是字符串类型
            delete newNode.icon;
            // 递归处理子节点
            if (newNode.children) {
                const filteredChildren = filterTree(newNode.children);
                if (filteredChildren.length > 0) {
                    newNode.children = filteredChildren;
                } else {
                    // 若子节点全被过滤，删除 children 属性
                    delete newNode.children;
                }
            }
            return newNode;
        });
};

const onDelete = async (row: any) => {
    try {
        await deleteMenuAPI({ id: row.id });
        getMenuList();
        arcoMessage("success", "删除成功");
    } catch (error) {
        console.error(error);
        arcoMessage("error", "删除失败");
    }
};

// API权限分配相关状态
const apiPermissionVisible = ref(false);
const currentMenuRecord = ref<any>(null);

// 分配API权限
const onAssignApi = (record: any) => {
    currentMenuRecord.value = record;
    apiPermissionVisible.value = true;
};

// API权限分配成功回调
const onApiPermissionSuccess = () => {
    arcoMessage("success", "API权限分配成功");
    currentMenuRecord.value = null;
    getMenuList();
};



// 导出菜单
const onExport = async () => {
    //console.log(selectedKeys.value);
    if (selectedKeys.value.length === 0) {
        arcoMessage("warning", "请选择要导出的菜单");
        return;
    }
    try {
        const response: any = await exportMenuAPI({ menuIds: selectedKeys.value });

        // 创建下载链接
        const blob = new Blob([response], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `menu_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        // 导出成功
        arcoMessage("success", "导出成功");
    } catch (error) {
        console.error(error);
    }
};


const fileInputRef = ref<HTMLInputElement | null>(null);
// 导入菜单
const onImport = () => {
    // 如果元素不存在则创建
    if (!fileInputRef.value) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';

        // 添加change事件监听器
        fileInput.addEventListener('change', async (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];

                // 创建FormData对象
                const formData = new FormData();
                formData.append('file', file);

                try {
                    // 调用导入API
                    await importMenuAPI(formData);

                    // 导入成功后刷新菜单列表
                    await getMenuList();

                    // 显示成功消息
                    arcoMessage("success", "菜单导入成功");
                } catch (error) {
                    console.error(error);
                    arcoMessage("error", "菜单导入失败");
                }

                // 清空文件输入以允许选择相同文件
                fileInput.value = '';
            }
        });

        document.body.appendChild(fileInput);
        fileInputRef.value = fileInput;
    }

    // 触发文件选择对话框
    fileInputRef.value.click();
};

onMounted(() => {
    getMenuList();
});


</script>

<style lang="scss" scoped>
:deep(.arco-typography code) {
    font-size: 100%;
}
</style>
