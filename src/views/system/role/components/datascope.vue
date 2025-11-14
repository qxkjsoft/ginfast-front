<template>
    <div class="data-scope-container">
        <a-form :model="formModel" layout="vertical">
            <a-form-item label="角色名称">
                <a-input v-model="formModel.roleName" disabled />
            </a-form-item>
            <a-form-item label="权限范围(默认可以查看自己创建的数据)">
                <a-select v-model="formModel.dataScope" placeholder="请选择权限范围" @change="onDataScopeChange" allow-clear>
                    <a-option value="1">全部</a-option>
                    <a-option value="2">自定义</a-option>
                    <a-option value="3">本部门</a-option>
                    <a-option value="4">本部门及子级</a-option>
                </a-select>
            </a-form-item>

            <!-- 自定义权限范围时显示部门树 -->
            <a-form-item v-if="formModel.dataScope === '2'" label="部门权限">
                <div style="display: flex; flex-direction: column;">
                    <!-- 部门树操作按钮 -->
                    <a-card v-if="treeData.length > 0" :bordered="false" class="tree-operation-card">
                        <a-space size="medium">
                            <span>展开全部</span>
                            <a-switch type="round" v-model="treeSwitch.expandAll" @change="onExpandAll">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </a-switch>

                            <span>全选节点</span>
                            <a-switch type="round" v-model="treeSwitch.selectAll" @change="onSelectAll">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </a-switch>

                            <a-tooltip content="父子节点关联选择，开启后选中父节点会自动选中所有子节点">
                                <span>父子关联 <icon-question-circle-fill /></span>
                            </a-tooltip>
                            <a-switch type="round" v-model="treeSwitch.checkStrictly" @change="onCheckStrictlyChange">
                                <template #checked> 是 </template>
                                <template #unchecked> 否 </template>
                            </a-switch>
                        </a-space>
                    </a-card>

                    <!-- 部门树 -->
                    <a-card :bordered="false" class="tree-container">

                        <div v-if="loading" class="tree-loading">
                            <a-spin tip="加载中..." />
                        </div>
                        <div v-else-if="treeData.length === 0" class="tree-empty">
                            <a-empty description="暂无部门数据" />
                        </div>
                        <a-tree v-else ref="treeRef" :field-names="fieldNames" :data="treeData" :checkable="true"
                            :show-line="true" :check-strictly="!treeSwitch.checkStrictly"
                            v-model:checked-keys="checkedKeys" @check="onTreeCheck" />
                    </a-card>
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { getDivisionAPI } from '@/api/department'
// 引入icon-question-circle-fill
import { IconQuestionCircleFill } from '@arco-design/web-vue/es/icon'


// 部门树节点接口定义
interface DepartmentTreeNode {
    id: number
    name: string
    children?: DepartmentTreeNode[]
}

const props = defineProps({
    title: {
        type: String,
        default: ""
    },
    // 接收初始选中的部门ID列表
    defaultCheckedKeys: {
        type: Array as () => number[],
        default: () => []
    },
    dataScope: {
        type: String,
        default: ""
    }
})

// 定义事件发射
const emit = defineEmits<{
    (e: 'update:checkedKeys', value: any): void
}>()

// 表单数据模型
const formModel = reactive({
    roleName: props.title,
    dataScope: ''
})

// 部门树相关
const treeRef = ref()
const fieldNames = ref({
    key: 'id',
    title: 'name',
    children: 'children'
})
const treeData = ref<DepartmentTreeNode[]>([])
const checkedKeys = ref<number[]>([])
const loading = ref(false)

// 树操作开关
const treeSwitch = ref({
    expandAll: true,     // 展开全部
    selectAll: false,    // 全选
    checkStrictly: false // 父子节点关联选择（注意：这里默认是false，表示关联选择是开启的）
})

// 获取部门数据
const getDivision = async () => {
    try {
        loading.value = true
        const res = await getDivisionAPI()
        treeData.value = res.data.list as DepartmentTreeNode[]

        // 如果需要展开全部，默认展开
        if (treeSwitch.value.expandAll && treeRef.value) {
            setTimeout(() => {
                treeRef.value?.expandAll(true)
            }, 0)
        }
    } catch (error) {
        console.error('获取部门数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 权限范围变化处理
const onDataScopeChange = (value: string) => {
    if (value === '2') {
        // 如果是自定义权限范围，加载部门数据
        if (treeData.value.length === 0) {
            getDivision()
        }
    }
    checkedKeys.value = []
    emit('update:checkedKeys',
        {
            dataScope: formModel.dataScope,
            checkedKeys: []
        }
    )

}

// 树节点选中变化处理
const onTreeCheck = (keys: number[]) => {
    checkedKeys.value = keys
    // 发送选中节点变化事件
    emit('update:checkedKeys', {
        dataScope: formModel.dataScope,
        checkedKeys: keys
    })
}

// 展开全部
const onExpandAll = (state: boolean) => {
    treeRef.value?.expandAll(state)
}

// 全选
const onSelectAll = (state: boolean) => {
    if (state) {
        // 全选所有节点
        const allKeys = getAllNodeKeys(treeData.value)
        checkedKeys.value = allKeys
        emit('update:checkedKeys',
            {
                dataScope: formModel.dataScope,
                checkedKeys: allKeys
            }
        )
    } else {
        // 取消全选
        checkedKeys.value = []
        emit('update:checkedKeys',
            {
                dataScope: formModel.dataScope,
                checkedKeys: []
            }
        )
    }
}

// 父子节点关联选择变化
const onCheckStrictlyChange = (state: boolean) => {
    // 注意：check-strictly 为 true 时表示父子节点不关联
    // 所以这里的逻辑是反的
    console.log('父子节点关联选择状态:', !state)
}

// 获取所有节点的key
const getAllNodeKeys = (nodes: DepartmentTreeNode[]): number[] => {
    let keys: number[] = []
    nodes.forEach(node => {
        keys.push(node.id)
        if (node.children && node.children.length > 0) {
            keys = keys.concat(getAllNodeKeys(node.children))
        }
    })
    return keys
}

// 组件挂载时初始化
onMounted(() => {
    // // 如果有默认选中的节点，初始化时加载部门数据
    if (props.defaultCheckedKeys && props.defaultCheckedKeys.length > 0) {
        checkedKeys.value = props.defaultCheckedKeys || []
        getDivision()
    }

    // 设置默认选中的节点
    formModel.dataScope = props.dataScope
})

// 获取当前的 checkStrictly 状态
const getFormData = () => {
    return {
        dataScope: formModel.dataScope,
        checkedKeys: checkedKeys.value
    }
}



defineExpose({
    getFormData
})

</script>

<style lang='scss' scoped>
.data-scope-container {
    padding: 20px;
}

.tree-loading {
    text-align: center;
    padding: 20px;
}

.tree-empty {
    text-align: center;
    padding: 20px;
}

.tree-operation-card {
    margin-bottom: 16px;
}

.text-right-gap {
    margin-right: 8px;
}
</style>