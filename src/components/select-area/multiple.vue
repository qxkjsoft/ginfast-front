<template>
  <div class="select-area-container">
    <a-cascader
      path-mode
      v-model="internalValue"
      :options="options"
      :style="{width:'320px'}"
      placeholder="请选择区域"
      allow-clear
      multiple
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { getAreaData, AreaItem } from '@/api/area'

interface Props {
  modelValue?: string[]
  /** 地区选择级数，默认3级 */
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 3
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// 内部值：二维数组（Arco cascader path-mode + multiple 的原生格式）
// 外部 modelValue 为逗号分隔的路径字符串数组，需在内外之间做转换
const internalValue = ref<string[][]>([])
// 原始地区选项数据
const rawData = ref<AreaItem[]>([])

/**
 * 根据指定级数过滤地区数据
 * @param data 原始地区数据
 * @param maxLevel 最大级别（从1开始）
 * @param currentLevel 当前级别
 * @returns 过滤后的地区数据
 */
function filterAreaByLevel(data: AreaItem[], maxLevel: number, currentLevel: number = 1): AreaItem[] {
  return data.map(item => {
    const newItem: AreaItem = { ...item }
    
    if (currentLevel < maxLevel && item.children && item.children.length > 0) {
      newItem.children = filterAreaByLevel(item.children, maxLevel, currentLevel + 1)
    } else {
      // 达到最大级别，移除 children
      delete newItem.children
    }
    
    return newItem
  })
}

// 计算属性：根据 level 过滤后的地区数据
const options = computed(() => {
  if (rawData.value.length === 0) return []
  return filterAreaByLevel(rawData.value, props.level)
})

// 获取地区数据
const loadAreaData = async () => {
  try {
    const data = await getAreaData()
    rawData.value = data
  } catch (error) {
    console.error('加载地区数据失败:', error)
    rawData.value = []
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAreaData()
})

// 监听外部传入的逗号字符串数组，拆分为二维路径数组
watch(
  () => props.modelValue,
  (newVal) => {
    internalValue.value = newVal ? newVal.map((s) => s.split(',')) : []
  },
  { immediate: true }
)

// 值变化时，将二维路径数组拼接回逗号字符串数组
const handleChange = (value: string[][] | undefined) => {
  const result = value && value.length > 0 ? value.map((arr) => arr.join(',')) : []
  emit('update:modelValue', result)
}
</script>

<style lang="scss" scoped>
.select-area-container {
  display: inline-block;
  width: 100%;
}

:deep(.arco-cascader) {
  width: 100%;
}
</style>
