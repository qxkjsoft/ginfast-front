<template>
  <a-modal
    v-model:visible="modalVisible"
    title="添加用户"
    :ok-loading="addUserLoading"
    :on-before-ok="handleAddUser"
    @close="handleCancel"
    width="900px"
  >
    <div class="add-user-container">
      <!-- 搜索区域 -->
      <a-card class="search-card">
        <a-form :model="searchForm" layout="inline" auto-label-width>
          <a-form-item field="name" label="用户名或昵称">
            <a-input
              v-model="searchForm.name"
              placeholder="请输入用户名或昵称"
              allow-clear
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                查询
              </a-button>
              <a-button @click="handleReset">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 用户列表表格 -->
      <a-table
        row-key="id"
        :data="userList"
        :loading="tableLoading"
        :pagination="pagination"
        :row-selection="rowSelection"
        v-model:selected-keys="selectedUserIds"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        size="small"
        :bordered="{ cell: true }"
        :scroll="{ y: '300px' }"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" align="center"></a-table-column>
          <a-table-column title="用户名" data-index="userName" :width="160" ellipsis tooltip></a-table-column>
          <a-table-column title="昵称" data-index="nickName" :width="160" ellipsis tooltip></a-table-column>
          <a-table-column title="域" data-index="tenant.name" :width="160" ellipsis tooltip></a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="160">
            <template #cell="{ record }">
              {{ formatTime(record.createdAt) }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type AccountItem } from "@/api/user";
import { getAccountListAllAPI } from "@/api/sysusertenant";

import { formatTime } from "@/globals";
import { arcoMessage } from "@/globals";

interface Props {
  visible: boolean;
  tenantId?: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success", userIds: number[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  tenantId: 0
});

const emit = defineEmits<Emits>();

// 弹窗可见性
const modalVisible = ref(false);

// 加载状态
const addUserLoading = ref(false);
const tableLoading = ref(false);

// 用户列表
const userList = ref<AccountItem[]>([]);

// 已选择的用户 ID 列表
const selectedUserIds = ref<number[]>([]);

// 搜索表单
const searchForm = ref({
  name: "",
  pageNum: 1,
  pageSize: 10
});

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showPageSize: true,
  showTotal: true,
  pageSizeOptions: ["10", "20", "50", "100"]
});

// 表格行选择配置
const rowSelection = ref({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false
});

// 加载用户列表
const loadUserList = async () => {
  if (!props.tenantId) return;

  try {
    tableLoading.value = true;
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      notTenantId: props.tenantId,
      notGlobal: true,
    };

    const res = await getAccountListAllAPI(params);
    userList.value = res.data.list;
    pagination.value.total = res.data.total;
  } catch (error) {
    console.error("获取用户列表失败:", error);
    arcoMessage("error", "获取用户列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 搜索用户
const handleSearch = () => {
  pagination.value.current = 1;
  loadUserList();
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    name: "",
    pageNum: 1,
    pageSize: 10
  };
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadUserList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadUserList();
};

// 添加用户确认
const handleAddUser = async () => {
  if (!props.tenantId || selectedUserIds.value.length === 0) {
    arcoMessage("warning", "请选择要添加的用户");
    return false;
  }

  try {
    addUserLoading.value = true;
    // 返回true表示操作成功，由父组件处理具体的添加逻辑
    emit("success", selectedUserIds.value);
    addUserLoading.value = false;
    return true;
  } catch (error) {
    addUserLoading.value = false;
    console.error("添加用户失败:", error);
    arcoMessage("error", "添加用户失败");
    return false;
  }
};

// 取消操作
const handleCancel = () => {
  emit("update:visible", false);
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  newVal => {
    modalVisible.value = newVal;
    if (newVal) {
      // 重置状态
      searchForm.value = {
        name: "",
        pageNum: 1,
        pageSize: 10
      };
      pagination.value.current = 1;
      selectedUserIds.value = [];
      loadUserList();
    }
  }
);

// 监听弹窗可见性变化
watch(modalVisible, newVal => {
  if (!newVal) {
    emit("update:visible", false);
  }
});
</script>

<style lang="scss" scoped>
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