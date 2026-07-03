<template>
    <div class="area-tree-select-container">
        <a-tree-select v-model="internalValue" :data="treeData" :field-names="fieldNames"
            :placeholder="placeholder" :tree-props="{ defaultExpandAll }" allow-clear allow-search
            @change="onChange" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { getAreaData, type AreaItem } from '@/api/area'

interface Props {
    /** 绑定值：选中的地区编码（单值） */
    modelValue?: string
    /** 可选最大层级（1省/2市/3区县/4街道），默认 3 */
    maxLevel?: number
    /** 占位提示文本 */
    placeholder?: string
    /** 下拉面板打开时是否默认展开全部节点 */
    defaultExpandAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    maxLevel: 3,
    placeholder: '请选择上级地区',
    defaultExpandAll: false
})
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const fieldNames = { key: 'value', title: 'label', children: 'children' }

// 内部值：单值（地区编码）
const internalValue = ref(props.modelValue || '')
// 原始地区数据（完整树）
const rawData = ref<AreaItem[]>([])

// 监听外部传入的值
watch(
    () => props.modelValue,
    (newVal) => {
        internalValue.value = newVal || ''
    }
)

/**
 * 根据指定级数过滤地区数据
 * 超出 maxLevel 的层级被剥离，使 maxLevel 层节点作为可选叶子
 * @param data 原始地区数据
 * @param maxLevel 最大可选级别（从1开始）
 * @param currentLevel 当前级别
 * @returns 过滤后的地区数据
 */
function filterAreaByLevel(data: AreaItem[], maxLevel: number, currentLevel: number = 1): AreaItem[] {
    return data.map((item) => {
        const newItem: AreaItem = { ...item }

        if (currentLevel < maxLevel && item.children && item.children.length > 0) {
            newItem.children = filterAreaByLevel(item.children, maxLevel, currentLevel + 1)
        } else {
            // 达到最大级别，移除 children，使其作为可选叶子节点
            delete newItem.children
        }

        return newItem
    })
}

// 计算属性：根据 maxLevel 过滤后的地区数据
const treeData = computed(() => {
    if (rawData.value.length === 0) return []
    return filterAreaByLevel(rawData.value, props.maxLevel)
})

// 加载地区数据（走全局缓存）
const loadAreaData = async () => {
    try {
        rawData.value = await getAreaData()
    } catch (error) {
        console.error('加载地区数据失败:', error)
        rawData.value = []
    }
}

onMounted(loadAreaData)

// 值变化时通知父组件
const onChange = (value: string | undefined) => {
    emit('update:modelValue', value || '')
}
</script>

<style lang="scss" scoped>
.area-tree-select-container {
    display: inline-block;
    width: 100%;
}

:deep(.arco-tree-select) {
    width: 100%;
}
</style>
