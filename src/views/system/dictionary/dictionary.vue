<template>
  <div class="snow-page">
    <div class="snow-inner">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="form.name" placeholder="请输入字典名称" allow-clear />
            <a-input v-model="form.code" placeholder="请输入字典编码" allow-clear />
            <a-select placeholder="启用状态" v-model="form.status" style="width: 120px" allow-clear>
              <a-option v-for="item in openState" :key="item.value" :value="item.value">{{ item.name }}</a-option>
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
            <a-button type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              <span>新增</span>
            </a-button>
            <a-button type="primary" status="danger">
              <template #icon><icon-delete /></template>
              <span>删除</span>
            </a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dictList"
        :bordered="{ cell: true }"
        :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        :pagination="pagination"
        :row-selection="{ type: 'checkbox', showCheckedAll: true }"
        :selected-keys="selectedKeys"
        @select="select"
        @select-all="selectAll"
      >
        <template #columns>
          <a-table-column title="序号" :width="64">
            <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
          </a-table-column>
          <a-table-column title="字典名称" data-index="name"></a-table-column>
          <a-table-column title="字典编码" data-index="code"></a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag bordered size="small" color="arcoblue" v-if="record.status === 1">启用</a-tag>
              <a-tag bordered size="small" color="red" v-else>禁用</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" :ellipsis="true" :tooltip="true"></a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180"></a-table-column>
          <a-table-column title="操作" :width="280" align="center" :fixed="'right'">
            <template #cell="{ record }">
              <a-space>
                <a-button type="primary" status="success" size="mini" @click="onDictData(record)">
                  <template #icon><icon-file /></template>
                  <span>字典值</span>
                </a-button>
                <a-button type="primary" size="mini" @click="onUpdate(record)">
                  <template #icon><icon-edit /></template>
                  <span>修改</span>
                </a-button>
                <a-popconfirm type="warning" content="确定删除该字典吗?" @ok="onDelete(record)">
                  <a-button type="primary" status="danger" size="mini">
                    <template #icon><icon-delete /></template>
                    <span>删除</span>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal v-model:visible="open" @close="afterClose" @ok="handleOk" @cancel="afterClose">
      <template #title> {{ title }} </template>
      <div>
        <a-form ref="formRef" auto-label-width :rules="rules" :model="addFrom">
          <a-form-item field="name" label="字典名称" validate-trigger="blur">
            <a-input v-model="addFrom.name" placeholder="请输入字典名称" allow-clear />
          </a-form-item>
          <a-form-item field="code" label="字典编码" validate-trigger="blur">
            <a-input v-model="addFrom.code" placeholder="请输入字典编码" allow-clear />
          </a-form-item>
          <a-form-item field="description" label="描述" validate-trigger="blur">
            <a-textarea v-model="addFrom.description" placeholder="请输入字典描述" allow-clear />
          </a-form-item>
          <a-form-item field="description" label="状态" validate-trigger="blur">
            <a-switch type="round" :checked-value="1" :unchecked-value="0" v-model="addFrom.status">
              <template #checked> 启用 </template>
              <template #unchecked> 禁用 </template>
            </a-switch>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <a-modal width="50%" v-model:visible="detailOpen" @ok="detailOk" ok-text="关闭" :hide-cancel="true">
      <template #title> 字典详情 </template>
      <div>
        <a-row>
          <a-space wrap>
            <a-button type="primary" @click="onAddDetail">
              <template #icon><icon-plus /></template>
              <span>新增</span>
            </a-button>
            <a-button type="primary" status="danger">
              <template #icon><icon-delete /></template>
              <span>删除</span>
            </a-button>
          </a-space>
        </a-row>

        <a-table
          row-key="id"
          :data="dictDetail.list"
          :bordered="{ cell: true }"
          :loading="detailLoading"
          :scroll="{ x: '100%', y: '100%' }"
          :pagination="false"
          :row-selection="{ type: 'checkbox', showCheckedAll: true }"
          :selected-keys="selectedKeysDetail"
          @select="selectDetail"
          @select-all="selectAllDetail"
        >
          <template #columns>
            <a-table-column title="序号" :width="64">
              <template #cell="cell">{{ cell.rowIndex + 1 }}</template>
            </a-table-column>
            <a-table-column title="字典名" data-index="name"></a-table-column>
            <a-table-column title="字典值" data-index="value"></a-table-column>
            <a-table-column title="状态" :width="100" align="center">
              <template #cell="{ record }">
                <a-tag bordered size="small" color="arcoblue" v-if="record.status === 1">启用</a-tag>
                <a-tag bordered size="small" color="red" v-else>禁用</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="操作" align="center" :fixed="'right'">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="primary" size="mini" @click="onDetailUpdate(record)">
                    <template #icon><icon-edit /></template>
                    <span>修改</span>
                  </a-button>
                  <a-popconfirm type="warning" content="确定删除该字典吗?" @ok="onDeleteDetail(record)">
                    <a-button type="primary" status="danger" size="mini">
                      <template #icon><icon-delete /></template>
                      <span>删除</span>
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-modal v-model:visible="detailCaseOpen" @close="afterCloseDetail" @ok="handleOkDetail" @cancel="afterCloseDetail">
      <template #title> {{ detailTitle }} </template>
      <div>
        <a-form ref="detailFormRef" auto-label-width :rules="detaulRules" :model="deatilForm">
          <a-form-item field="name" label="字典名称" validate-trigger="blur">
            <a-input v-model="deatilForm.name" placeholder="请输入字典名称" allow-clear />
          </a-form-item>
          <a-form-item field="value" label="字典值" validate-trigger="blur">
            <a-input v-model="deatilForm.value" placeholder="请输入字典值" allow-clear />
          </a-form-item>
          <a-form-item field="description" label="状态" validate-trigger="blur">
            <a-switch type="round" :checked-value="1" :unchecked-value="0" v-model="deatilForm.status">
              <template #checked> 启用 </template>
              <template #unchecked> 禁用 </template>
            </a-switch>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { deepClone } from "@/utils";
import {
  getDictListAPI,
  addDictAPI,
  updateDictAPI,
  deleteDictAPI,
  getDictItemsByDictIdAPI,
  addDictItemAPI,
  updateDictItemAPI,
  deleteDictItemAPI,
  type SystemDict,
  type DictListParams,
  type DictAddParams,
  type DictUpdateParams,
  type SystemDictItem,
  type DictItemAddParams,
  type DictItemUpdateParams
} from "@/api/dictionary";
const openState = ref(dictFilter("status"));
const form = ref<DictListParams>({
  name: "",
  code: "",
  status: undefined
});
const search = () => {
  getDict();
};
const reset = () => {
  form.value = {
    name: "",
    code: "",
    status: undefined
  };
  currentPage.value = 1;
  getDict();
};

const open = ref<boolean>(false);
const title = ref<string>("");
const rules = {
  name: [
    {
      required: true,
      message: "请输入字典名称"
    }
  ],
  code: [
    {
      required: true,
      message: "请输入字典编码"
    }
  ],
  status: [
    {
      required: true,
      message: "请选择状态"
    }
  ]
};
const addFrom = ref<DictAddParams & { id?: number }>({
  name: "",
  code: "",
  description: "",
  status: 1
});
const formRef = ref();
const onAdd = () => {
  open.value = true;
  title.value = "新增字典";
};
const handleOk = async () => {
  let state = await formRef.value.validate();
  if (state) return; // 校验不通过

  try {
    if (addFrom.value.id) {
      // 编辑模式
      const updateData: DictUpdateParams = {
        id: addFrom.value.id,
        name: addFrom.value.name,
        code: addFrom.value.code,
        status: addFrom.value.status,
        description: addFrom.value.description
      };
      await updateDictAPI(updateData);
      arcoMessage("success", "修改字典成功");
    } else {
      // 新增模式
      const addData: DictAddParams = {
        name: addFrom.value.name,
        code: addFrom.value.code,
        status: addFrom.value.status,
        description: addFrom.value.description
      };
      await addDictAPI(addData);
      arcoMessage("success", "新增字典成功");
    }
    open.value = false;
    getDict();
  } catch (error) {
    console.error("操作失败:", error);
    arcoMessage("error", "操作失败");
  }
};
// 关闭对话框动画结束后触发
const afterClose = () => {
  formRef.value.resetFields();
  addFrom.value = {
    name: "",
    code: "",
    description: "",
    status: 1
  };
};
const onUpdate = (record: SystemDict) => {
  title.value = "修改字典";
  addFrom.value = { ...deepClone(record) };
  open.value = true;
};

// 删除字典
const onDelete = async (record: SystemDict) => {
  try {
    await deleteDictAPI({ id: record.id });
    arcoMessage("success", "删除成功");
    getDict();
  } catch (error) {
    console.error("删除失败:", error);
    arcoMessage("error", "删除失败");
  }
};

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const pagination = ref({
  current: currentPage,
  pageSize: pageSize,
  total: total,
  showPageSize: true,
  showTotal: true,
  onChange: (page: number) => {
    currentPage.value = page;
    getDict();
  },
  onPageSizeChange: (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    getDict();
  }
});
const selectedKeys = ref<number[]>([]);
const select = (list: number[]) => {
  selectedKeys.value = list;
};
const selectAll = (state: boolean) => {
  selectedKeys.value = state ? dictList.value.map((el: SystemDict) => el.id) : [];
};
const dictList = ref<SystemDict[]>([]);
const getDict = async () => {
  loading.value = true;
  try {
    const params: DictListParams = {
      page: currentPage.value,
      limit: pageSize.value,
      ...form.value
    };
    const res = await getDictListAPI(params);
    if (res.data) {
      dictList.value = res.data.list || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取字典列表失败:", error);
    arcoMessage("error", "获取字典列表失败");
  } finally {
    loading.value = false;
  }
};

// 字典详情
const detailLoading = ref(false);
const detailOpen = ref(false);
const currentDict = ref<SystemDict | null>(null);
const dictDetail = ref<{
  list: SystemDictItem[];
}>({
  list: []
});
const onDictData = async (record: SystemDict) => {
  currentDict.value = record;
  detailOpen.value = true;
  await getDictItems(record.id);
};
const getDictItems = async (dictId: number) => {
  detailLoading.value = true;
  try {
    const res = await getDictItemsByDictIdAPI(dictId);
    dictDetail.value.list = res.data?.list || [];
  } catch (error) {
    console.error("获取字典项失败:", error);
    arcoMessage("error", "获取字典项失败");
  } finally {
    detailLoading.value = false;
  }
};
const detailOk = () => {
  detailOpen.value = false;
  currentDict.value = null;
  dictDetail.value.list = [];
};
const deatilForm = ref<DictItemAddParams & { id?: number }>({
  name: "",
  value: "",
  status: 1,
  dictId: 0
});
const detaulRules = ref({
  name: [
    {
      required: true,
      message: "请输入字典名称"
    }
  ],
  value: [
    {
      required: true,
      message: "请输入字典值"
    }
  ],
  status: [
    {
      required: true,
      message: "请选择状态"
    }
  ]
});
const detailFormRef = ref();
const detailTitle = ref("");
const detailCaseOpen = ref(false);
const onAddDetail = () => {
  detailTitle.value = "新增字典数据";
  deatilForm.value = {
    name: "",
    value: "",
    status: 1,
    dictId: currentDict.value?.id || 0
  };
  detailCaseOpen.value = true;
};
const handleOkDetail = async () => {
  let state = await detailFormRef.value.validate();
  if (state) return; // 校验不通过

  try {
    if (deatilForm.value.id) {
      // 编辑模式
      const updateData: DictItemUpdateParams = {
        id: deatilForm.value.id,
        name: deatilForm.value.name,
        value: deatilForm.value.value,
        status: deatilForm.value.status,
        dictId: deatilForm.value.dictId
      };
      await updateDictItemAPI(updateData);
      arcoMessage("success", "修改字典项成功");
    } else {
      // 新增模式
      const addData: DictItemAddParams = {
        name: deatilForm.value.name,
        value: deatilForm.value.value,
        status: deatilForm.value.status,
        dictId: deatilForm.value.dictId
      };
      await addDictItemAPI(addData);
      arcoMessage("success", "新增字典项成功");
    }
    detailCaseOpen.value = false;
    if (currentDict.value) {
      await getDictItems(currentDict.value.id);
    }
  } catch (error) {
    console.error("操作失败:", error);
    arcoMessage("error", "操作失败");
  }
};
const onDetailUpdate = (record: SystemDictItem) => {
  detailTitle.value = "修改字典数据";
  deatilForm.value = { ...deepClone(record) };
  detailCaseOpen.value = true;
};

// 删除字典项
const onDeleteDetail = async (record: SystemDictItem) => {
  try {
    await deleteDictItemAPI({ id: record.id });
    arcoMessage("success", "删除成功");
    if (currentDict.value) {
      await getDictItems(currentDict.value.id);
    }
  } catch (error) {
    console.error("删除失败:", error);
    arcoMessage("error", "删除失败");
  }
};
// 关闭对话框动画结束后触发
const afterCloseDetail = () => {
  detailFormRef.value.resetFields();
  deatilForm.value = {
    name: "",
    value: "",
    status: 1,
    dictId: currentDict.value?.id || 0
  };
};
const selectedKeysDetail = ref<number[]>([]);
const selectDetail = (list: number[]) => {
  selectedKeysDetail.value = list;
};
const selectAllDetail = (state: boolean) => {
  selectedKeysDetail.value = state ? dictDetail.value.list.map((el: SystemDictItem) => el.id) : [];
};

getDict();
</script>

<style lang="scss" scoped></style>
