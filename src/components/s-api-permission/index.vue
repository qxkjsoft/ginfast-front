<template>
  <a-drawer :visible="visible" :width="800" @ok="handleOk" @cancel="handleCancel" :title="title" :ok-loading="loading">
    <div class="api-permission-container">
      <!-- 搜索区域 -->
      <a-card class="search-card">
        <a-form :model="searchForm" layout="inline" auto-label-width>
          <a-form-item field="title" label="API标题">
            <a-input
              v-model="searchForm.title"
              placeholder="请输入API标题"
              allow-clear
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </a-form-item>
          <a-form-item field="path" label="API路径">
            <a-input
              v-model="searchForm.path"
              placeholder="请输入API路径"
              allow-clear
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </a-form-item>
          <a-form-item field="method" label="请求方法">
            <a-select v-model="searchForm.method" placeholder="请求方法" allow-clear style="width: 120px">
              <a-option value="GET">GET</a-option>
              <a-option value="POST">POST</a-option>
              <a-option value="PUT">PUT</a-option>
              <a-option value="DELETE">DELETE</a-option>
              <a-option value="PATCH">PATCH</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="apiGroup" label="API分组">
            <a-input
              v-model="searchForm.apiGroup"
              placeholder="API分组"
              allow-clear
              style="width: 150px"
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

      <!-- 操作区域 -->
      <a-card class="actions-card">
        <a-row justify="space-between" align="center">
          <a-col :span="12">
            <a-space>
              <a-checkbox v-model="selectAllCurrent" @change="toggleSelectAll" :indeterminate="indeterminate">
                全选当前页
              </a-checkbox>
            </a-space>
          </a-col>
          <a-col :span="12">
            <a-space>
              <span
                >已选择 <a-tag color="blue">{{ selectedApiIds.length }}</a-tag> 个API</span
              >
              <a-button type="outline" size="mini" @click="clearSelection">清空选择</a-button>
              <a-button :type="showSelectedOnly ? 'primary' : 'outline'" size="mini" @click="toggleShowSelected">
                {{ showSelectedOnly ? "显示全部" : "显示已选" }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <!-- API列表表格 -->
      <a-table
        row-key="id"
        :data="apiList"
        :loading="tableLoading"
        :pagination="pagination"
        :row-selection="rowSelection"
        v-model:selected-keys="selectedApiIds"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        size="small"
        :bordered="{ cell: true }"
        :scroll="{ y: '400px' }"
      >
        <template #columns>
          <a-table-column title="API标题" data-index="title" :width="200" ellipsis tooltip></a-table-column>
          <a-table-column title="请求路径" data-index="path" :width="280" ellipsis tooltip></a-table-column>
          <a-table-column title="请求方法" data-index="method" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="getMethodColor(record.method)" size="small">
                {{ record.method }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="API分组" data-index="apiGroup" :width="150" ellipsis tooltip></a-table-column>
          <a-table-column title="创建时间" data-index="createdAt" :width="160">
            <template #cell="{ record }">
              {{ formatDate(record.createdAt) }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { getSysApiListAPI, getMenuApisAPI, setMenuApisAPI, type SysApiItem, type SysApiListParams } from "@/api/sysapi";

interface Props {
  visible: boolean;
  menuId?: number;
  menuName?: string;
  showSelected?: boolean;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  menuId: 0,
  menuName: "",
  showSelected: false
});

const emit = defineEmits<Emits>();

// 抽屉标题
const title = computed(() => {
  return props.menuName ? `分配API权限 - ${props.menuName}` : "分配API权限";
});

// 加载状态
const loading = ref(false);
const tableLoading = ref(false);

// 已选择的API ID列表
const selectedApiIds = ref<number[]>([]);

// 是否显示已选API
const showSelectedOnly = ref(false);

// API列表
const apiList = ref<SysApiItem[]>([]);

// 搜索表单
const searchForm = ref<SysApiListParams>({
  title: "",
  path: "",
  method: "",
  apiGroup: "",
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

// 全选状态
const selectAllCurrent = ref(false);
const indeterminate = ref(false);

// 表格行选择配置
const rowSelection = ref({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false
});

// 加载API列表
const loadApiList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize
    };

    // 如果显示已选状态且有menuId，则传递menuId参数
    if (showSelectedOnly.value && props.menuId) {
      params.menuId = props.menuId;
    }

    const res = await getSysApiListAPI(params);
    apiList.value = res.data.list;
    pagination.value.total = res.data.total;

    updateSelectAllState();
  } catch (error) {
    console.error("获取API列表失败:", error);
    arcoMessage("error", "获取API列表失败");
  } finally {
    tableLoading.value = false;
  }
};

// 加载菜单已关联的API
const loadMenuApis = async () => {
  if (!props.menuId) return;

  try {
    const res = await getMenuApisAPI(props.menuId);
    selectedApiIds.value = Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("获取菜单API失败:", error);
    // 如果接口不存在，使用空数组
    selectedApiIds.value = [];
  }
};

// 搜索API
const handleSearch = () => {
  pagination.value.current = 1;
  loadApiList();
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    title: "",
    path: "",
    method: "",
    apiGroup: "",
    pageNum: 1,
    pageSize: 10
  };
  handleSearch();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.current = page;
  loadApiList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.current = 1;
  loadApiList();
};

// 全选/取消全选当前页
const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    // 添加当前页所有API到选中列表
    const currentPageIds = apiList.value.map(api => api.id);
    const newSelectedIds = [...new Set([...selectedApiIds.value, ...currentPageIds])];
    selectedApiIds.value = newSelectedIds;
  } else {
    // 从选中列表移除当前页所有API
    const currentPageIds = apiList.value.map(api => api.id);
    selectedApiIds.value = selectedApiIds.value.filter(id => !currentPageIds.includes(id));
  }
  updateSelectAllState();
};

// 更新全选状态
const updateSelectAllState = () => {
  const currentPageIds = apiList.value.map(api => api.id);
  const selectedCurrentPageIds = selectedApiIds.value.filter(id => currentPageIds.includes(id));

  if (selectedCurrentPageIds.length === 0) {
    selectAllCurrent.value = false;
    indeterminate.value = false;
  } else if (selectedCurrentPageIds.length === currentPageIds.length && currentPageIds.length > 0) {
    selectAllCurrent.value = true;
    indeterminate.value = false;
  } else {
    selectAllCurrent.value = false;
    indeterminate.value = true;
  }
};

// 清空选择
const clearSelection = () => {
  selectedApiIds.value = [];
  selectAllCurrent.value = false;
  indeterminate.value = false;
};

// 切换显示已选状态
const toggleShowSelected = () => {
  showSelectedOnly.value = !showSelectedOnly.value;
  // 重置分页并重新加载数据
  pagination.value.current = 1;
  loadApiList();
};

// 获取请求方法标签颜色
const getMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    GET: "blue",
    POST: "green",
    PUT: "orange",
    DELETE: "red",
    PATCH: "purple"
  };
  return colors[method] || "gray";
};

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 确认操作
const handleOk = async () => {
  if (!props.menuId) {
    arcoMessage("error", "菜单ID不能为空");
    return;
  }

  try {
    loading.value = true;

    await setMenuApisAPI({
      menuId: props.menuId,
      apiIds: selectedApiIds.value
    });

    emit("success");
    emit("update:visible", false);
  } catch (error) {
    console.error("分配API权限失败:", error);
    arcoMessage("error", "分配API权限失败");
  } finally {
    loading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  emit("update:visible", false);
};

// 监听选中的API变化，更新全选状态
watch(
  selectedApiIds,
  () => {
    updateSelectAllState();
  },
  { deep: true }
);

// 监听抽屉显示状态
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      // 重置状态
      selectedApiIds.value = [];
      selectAllCurrent.value = false;
      indeterminate.value = false;
      showSelectedOnly.value = props.showSelected;

      // 重置搜索表单
      searchForm.value = {
        title: "",
        path: "",
        method: "",
        apiGroup: "",
        pageNum: 1,
        pageSize: 10
      };
      pagination.value.current = 1;

      // 加载数据
      loadMenuApis();
      loadApiList();
    }
  }
);
</script>

<style lang="scss" scoped>
.api-permission-container {
  .search-card,
  .actions-card {
    margin-bottom: 16px;
  }

  .search-card {
    :deep(.arco-card-body) {
      padding-bottom: 0;
    }
  }

  .actions-card {
    :deep(.arco-card-body) {
      padding: 12px 20px;
    }
  }
}
</style>
