<template>
  <a-drawer
    :visible="visible"
    :width="layoutMode.width"
    :hide-cancel="true"
    ok-text="关闭"
    @ok="handleCancel"
    @cancel="handleCancel"
    :title="title"
    :ok-loading="loading"
  >
    <div class="tenant-user-container">
      <!-- 操作区域 -->
      <a-card class="actions-card">
        <a-row justify="space-between" align="center">
          <a-col :span="isMobile ? 24 : 12">
            <a-space>
              <a-button type="primary" @click="showAddUserModal">
                <template #icon><icon-plus /></template>
                添加其他租户用户
              </a-button>
            </a-space>
          </a-col>
          <a-col :span="isMobile ? 24 : 12">
            <a-space>
              <a-input
                v-model="searchKeyword"
                placeholder="请输入账号或昵称"
                :style="{ width: '200px' }"
                allow-clear
                @keyup.enter="handleSearch"
              />
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                搜索
              </a-button>
              <a-button @click="handleResetSearch" :disabled="!searchKeyword">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <!-- 已关联用户列表表格 -->
      <a-table
        row-key="userID"
        :data="tenantUserList"
        :loading="tableLoading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        size="small"
        :bordered="{ cell: true }"
        :scroll="{ y: '400px' }"
      >
        <template #columns>
          <a-table-column title="ID" data-index="userID" :width="70" align="center"></a-table-column>
          <a-table-column title="用户名" :width="150" ellipsis tooltip>
            <template #cell="{ record }">
              {{ record.user?.userName }}
            </template>
          </a-table-column>
          <a-table-column title="昵称" :width="150" ellipsis tooltip>
            <template #cell="{ record }">
              {{ record.user?.nickName }}
            </template>
          </a-table-column>
          <a-table-column title="本地" :width="50">
              <template #cell="{ record }">
                {{ record.isDefault ? '是' : '否' }}
              </template>
          </a-table-column>
          <a-table-column title="租户" :width="120" ellipsis tooltip>
            <template #cell="{ record }">
              {{ record.user?.tenant?.name }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
				<template v-if="!record.isDefault">
					<a-popconfirm content="确定要移除该用户吗?" @ok="removeUser(record)"  >
						<a-link type="text" status="danger" size="small">移除</a-link>
					</a-popconfirm>
					<a-link type="text" size="small" @click="showRoleModal(record)">分配角色</a-link>
				</template>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-drawer>

  <!-- 添加用户弹窗 -->
  <s-add-user-modal
    :width="layoutMode.width"
    v-model:visible="addUserModalVisible"
    :tenant-id="tenantId"
    @success="handleAddUserSuccess"
  />

  <!-- 角色分配弹窗 -->
  <a-modal
    :visible="roleModalVisible"
    :title="`为用户 ${currentUserInfo.userName} 分配角色`"
    :width="layoutMode.width"
    @ok="handleRoleSubmit"
    @cancel="handleRoleCancel"
    :ok-loading="roleModalLoading"
  >
    <a-form :model="roleForm" :layout="layoutMode.layout" auto-label-width>
      <a-form-item label="用户">
        {{ currentUserInfo.userName }} ({{ currentUserInfo.nickName }})
      </a-form-item>
      <a-form-item label="角色">
        <a-tree-select
          v-model="roleForm.roles"
          :data="roleList"
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children'
          }"
          multiple
          placeholder="请选择角色"
          :allow-clear="true"
          :tree-checkable="true"
          tree-checked-strategy="all"
          :style="{ width: '100%' }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {
  getSysUserTenantList,
  batchDeleteSysUserTenant,
  batchAddSysUserTenant,
  getRolesAllAPI,
  getUserRoleIDs,
  setUserRoles,
  type SysUserTenantListParam,
  type SysUserTenant
} from "@/api/sysusertenant";
import SAddUserModal from "@/components/s-add-user-modal/index.vue";
import type { RoleItem } from "@/api/role";
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => {
  let info = {
    mobile: {
      width: "95%",
      layout: "vertical"
    },
    desktop: {
      width: "60%",
      layout: "horizontal"
    }
  };
  return isMobile.value ? info.mobile : info.desktop;
});

interface Props {
  visible: boolean;
  tenantId?: number;
  tenantName?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  tenantId: 0,
  tenantName: ""
});

const emit = defineEmits<Emits>();

// 抽屉标题
const title = computed(() => {
  return props.tenantName ? `用户分配 - ${props.tenantName}` : "用户分配";
});

// 加载状态
const loading = ref(false);
const tableLoading = ref(false);

// 搜索相关状态
const searchKeyword = ref('');



// 租户用户列表（已关联的用户）
const tenantUserList = ref<SysUserTenant[]>([]);

// 分页配置（已关联用户列表）
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showPageSize: true,
  showTotal: true,
  pageSizeOptions: ["10", "20", "50", "100"]
});



// 添加用户弹窗相关状态
const addUserModalVisible = ref(false);

// 显示添加用户弹窗
const showAddUserModal = () => {
  addUserModalVisible.value = true;
};

// 处理添加用户成功事件
const handleAddUserSuccess = async (selectedUserIds: number[]) => {
  if (!props.tenantId || selectedUserIds.length === 0) {
    arcoMessage("warning", "请选择要添加的用户");
    return;
  }

  try {
    // 批量添加用户租户关联
    await batchAddSysUserTenant({
      userIDs: selectedUserIds,
      tenantID: props.tenantId
    });

    arcoMessage("success", "用户添加成功");
    addUserModalVisible.value = false;
    // 重新加载租户用户列表
    pagination.value.current = 1;
    loadTenantUserList();
    emit("success");
  } catch (error) {
    console.error("添加用户失败:", error);
    arcoMessage("error", "添加用户失败");
  }
};

// 加载租户已关联的用户列表
const loadTenantUserList = async () => {
  if (!props.tenantId) return;

  try {
    tableLoading.value = true;
    const params: SysUserTenantListParam = {
      tenantID: props.tenantId,
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize
    };
    
    // 如果有搜索关键词，添加到查询参数中
    if (searchKeyword.value.trim()) {
      params.key = searchKeyword.value.trim();
    }
    
    const res = await getSysUserTenantList(params);
    tenantUserList.value = res.data.list;
    pagination.value.total = res.data.total;
  } catch (error) {
    console.error("获取租户用户列表失败:", error);
    arcoMessage("error", "获取租户用户列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 移除单个用户
const removeUser = async (record: SysUserTenant) => {
  if (!props.tenantId) return;

  try {
    await batchDeleteSysUserTenant({
      userIDs: [record.userID],
      tenantID: props.tenantId
    });

    arcoMessage("success", "用户移除成功");
    // 重新加载租户用户列表
    loadTenantUserList();
  } catch (error) {
    console.error("移除用户失败:", error);
    arcoMessage("error", "移除用户失败");
  }
  
};



// 处理分页变化（已关联用户）
const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadTenantUserList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadTenantUserList();
};

// 搜索处理函数
const handleSearch = async () => {
  // 重置到第一页
  pagination.value.current = 1;
  await loadTenantUserList();
};

// 搜索重置函数
const handleResetSearch = async () => {
  // 清空搜索关键词
  searchKeyword.value = '';
  // 重置到第一页
  pagination.value.current = 1;
  // 重新加载数据
  await loadTenantUserList();
};

// 取消操作
const handleCancel = () => {
  emit("update:visible", false);
};

// 监听抽屉显示状态
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      pagination.value.current = 1;
      // 重置搜索关键词
      searchKeyword.value = '';
      // 加载数据
      loadTenantUserList();
    }
  }
);

// 监听搜索关键词变化，当清空时自动重新加载
watch(
  () => searchKeyword.value,
  (newVal, oldVal) => {
    // 如果从有值变为空值，自动重新加载
    if (oldVal && oldVal.trim() && !newVal.trim()) {
      pagination.value.current = 1;
      loadTenantUserList();
    }
  }
);

// 角色分配相关代码
// 角色弹窗相关状态
const roleModalVisible = ref(false);
const roleModalLoading = ref(false);
const roleList = ref<RoleItem[]>([]);
const currentUserInfo = ref({
  userID: 0,
  userName: '',
  nickName: ''
});

// 角色表单数据
const roleForm = ref({
  roles: [] as number[]
});

// 显示角色分配弹窗
const showRoleModal = async (record: SysUserTenant) => {
  // 设置当前用户信息
  currentUserInfo.value = {
    userID: record.userID,
    userName: record.user?.userName || '',
    nickName: record.user?.nickName || ''
  };
  
  // 加载本域角色列表
  await loadRoleList();
  
  // 加载用户当前拥有的角色
  await loadUserRoles(record.userID);
  
  // 显示弹窗
  roleModalVisible.value = true;
};

// 加载本域角色列表
const loadRoleList = async () => {
  if (!props.tenantId) return;
  
  try {
    const res = await getRolesAllAPI({ tenantID: props.tenantId });
    roleList.value = res.data.list;
  } catch (error) {
    console.error("获取角色列表失败:", error);
    arcoMessage("error", "获取角色列表失败");
  }
};

// 加载用户当前拥有的角色
const loadUserRoles = async (userId: number) => {
  if (!props.tenantId) return;
  
  try {
    const res = await getUserRoleIDs({ 
      userID: userId,
      tenantID: props.tenantId
    });
    roleForm.value.roles = res.data || [];
  } catch (error) {
    console.error("获取用户角色失败:", error);
    arcoMessage("error", "获取用户角色失败");
  }
};

// 处理角色提交
const handleRoleSubmit = async () => {
  if (!props.tenantId) return;
  
  try {
    roleModalLoading.value = true;
    
    await setUserRoles({
      userID: currentUserInfo.value.userID,
      roles: roleForm.value.roles,
      tenantID: props.tenantId
    });
    
    arcoMessage("success", "角色分配成功");
    roleModalVisible.value = false;
  } catch (error) {
    console.error("角色分配失败:", error);
    arcoMessage("error", "角色分配失败");
  } finally {
    roleModalLoading.value = false;
  }
};

// 处理角色弹窗取消
const handleRoleCancel = () => {
  roleModalVisible.value = false;
  roleForm.value.roles = [];
  currentUserInfo.value = {
    userID: 0,
    userName: '',
    nickName: ''
  };
};
</script>

<style lang="scss" scoped>
.tenant-user-container {
  .actions-card {
    margin-bottom: 16px;
  }

  .actions-card {
    :deep(.arco-card-body) {
      padding: 12px 20px;
    }
  }
}

.add-user-container {
  .search-card {
    margin-bottom: 16px;
  }

  .search-card {
    :deep(.arco-card-body) {
      padding-bottom: 0;
    }
  }
}
</style>
