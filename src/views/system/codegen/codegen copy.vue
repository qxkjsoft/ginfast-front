<template>
  <div class="snow-page">
    <a-card class="general-card">
      <a-row>
        <a-col :span="24">
          <a-form :model="formModel" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left"
            auto-label-width>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item field="database" label="数据库">
                  <a-select 
                    v-model="formModel.database" 
                    placeholder="请选择数据库" 
                    allow-clear
                    allow-search
                    @change="handleDatabaseChange"
                  >
                    <a-option 
                      v-for="database in databaseOptions" 
                      :key="database" 
                      :value="database"
                      :label="database"
                    />
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item field="table" label="数据表">
                  <a-select 
                    v-model="formModel.table" 
                    placeholder="请选择数据表" 
                    allow-clear
                    allow-search
                    :loading="tableLoading"
                    @change="handleTableChange"
                  >
                    <a-option 
                      v-for="table in tableOptions" 
                      :key="table" 
                      :value="table"
                      :label="table"
                    />
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-space wrap>
                  <a-button type="primary" @click="search">
                    <template #icon>
                      <icon-search />
                    </template>
                    查询
                  </a-button>
                  <a-button @click="reset">
                    <template #icon>
                      <icon-refresh />
                    </template>
                    重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>
      
      <!-- 字段信息表格 -->
      <a-row>
        <a-col :span="24">
          <a-table 
            row-key="name" 
            :loading="columnLoading" 
            :data="columnData" 
            :pagination="false"
            :scroll="{ y: '400px' }"
          >
            <template #columns>
              <a-table-column title="字段名" data-index="columnName" :width="150"></a-table-column>
              <a-table-column title="字段类型" data-index="dataType" :width="150"></a-table-column>
              <a-table-column title="是否可空" :width="100" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.isNullable === 'YES' ? 'red' : 'green'">
                    {{ record.isNullable === 'YES' ? '是' : '否' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="默认值" data-index="columnDefault" :width="150">
                <template #cell="{ record }">
                  {{ record.columnDefault.String || '-' }}
                </template>
              </a-table-column>
              <a-table-column title="是否主键" :width="100" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.columnKey.String === 'PRI' ? 'green' : 'gray'">
                    {{ record.columnKey.String === 'PRI' ? '是' : '否' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="注释" data-index="columnComment.String" :ellipsis="true" tooltip></a-table-column>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  getDatabases, 
  getTables, 
  getTableColumns,
  type DatabaseInfo,
  type TableInfo,
  type ColumnInfo
} from '@/api/syscodegen'

const databaseOptions = ref<DatabaseInfo[]>([])
const tableOptions = ref<TableInfo[]>([])
const columnData = ref<ColumnInfo[]>([])

const databaseLoading = ref(false)
const tableLoading = ref(false)
const columnLoading = ref(false)

const formModel = reactive({
  database: '',
  table: ''
})

// 获取数据库列表
const fetchDatabases = async () => {
  databaseLoading.value = true
  try {
    const res = await getDatabases()
    console.log('获取数据库列表成功', res)
    databaseOptions.value = res.data.databases
  } catch (error) {
    Message.error('获取数据库列表失败')
  } finally {
    databaseLoading.value = false
  }
}

// 获取表列表
const fetchTables = async (database: string) => {
  if (!database) {
    tableOptions.value = []
    formModel.table = ''
    return
  }
  
  tableLoading.value = true
  try {
    const res = await getTables(database)
    tableOptions.value = res.data.tables
    // 清空之前选择的表
    formModel.table = ''
    // 清空字段数据
    columnData.value = []
  } catch (error) {
    Message.error('获取表列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 获取字段信息
const fetchColumns = async (database: string, table: string) => {
  if (!database || !table) {
    columnData.value = []
    return
  }
  
  columnLoading.value = true
  try {
    const res = await getTableColumns(database, table)
    columnData.value = res.data.columns
  } catch (error) {
    Message.error('获取字段信息失败')
    columnData.value = []
  } finally {
    columnLoading.value = false
  }
}

// 数据库选择变化
const handleDatabaseChange = (value: string) => {
  formModel.table = ''
  columnData.value = []
  fetchTables(value)
}

// 表选择变化
const handleTableChange = (value: string) => {
  if (formModel.database && value) {
    fetchColumns(formModel.database, value)
  } else {
    columnData.value = []
  }
}

const search = () => {
  if (!formModel.database) {
    Message.warning('请选择数据库')
    return
  }
  
  if (!formModel.table) {
    Message.warning('请选择数据表')
    return
  }
  
  fetchColumns(formModel.database, formModel.table)
}

const reset = () => {
  formModel.database = ''
  formModel.table = ''
  tableOptions.value = []
  columnData.value = []
}

onMounted(() => {
  fetchDatabases()
})
</script>

<script lang="ts">
export default {
  name: 'Codegen'
}
</script>

<style scoped lang="scss">
.general-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>