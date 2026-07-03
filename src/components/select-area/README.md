# SelectArea 地区选择组件

基于 Arco Design Vue 封装的地区选择组件集，支持省/市/区/县/乡镇四级联动选择，提供级联选择、多选、树形选择三种模式。

## 特性

- 🌳 支持省/市/区/县/乡镇四级联动选择
- 🔍 支持搜索地区名称和编码
- 💾 内置数据缓存机制，避免重复请求
- 🔄 支持双向绑定（v-model）
- ✅ 支持单选、多选、树形选择三种模式
- 🎨 完全兼容 Arco Design Vue 样式规范
- ⚡ TypeScript 支持

## 组件说明

本目录包含三个组件：

| 组件 | 文件 | 绑定值 | 适用场景 |
|------|------|------|------|
| SelectArea | [`index.vue`](index.vue) | 逗号分隔的路径字符串 | 业务表单中选择地区（如用户所在地区） |
| SelectAreaMultiple | [`multiple.vue`](multiple.vue) | 路径字符串数组 | 业务表单中多选地区（如负责多个地区） |
| AreaTreeSelect | [`tree.vue`](tree.vue) | 单个地区编码 | 选择单个地区节点（如选择上级地区、父级编码） |

> **选型建议**：需要选择"一个地区作为业务值"时用 SelectArea / SelectAreaMultiple；需要选择"单个节点"（如父级编码）时用 AreaTreeSelect。

## 单选组件 (SelectArea)

### 基础用法

```vue
<template>
  <select-area v-model="areaCode" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

const areaCode = ref('');
</script>
```

### API

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值，逗号分隔的地区编码字符串 | `string \| undefined` | `undefined` |
| level | 地区选择级数 | `number` | `3` |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值变化时触发 | `(value: string)` |

## 多选组件 (SelectAreaMultiple)

### 基础用法

```vue
<template>
  <select-area-multiple v-model="areaCodes" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectAreaMultiple from '@/components/select-area/multiple.vue';

const areaCodes = ref<string[]>([]);
</script>
```

### API

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值，地区编码数组 | `string[] \| undefined` | `undefined` |
| level | 地区选择级数 | `number` | `3` |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值变化时触发 | `(value: string[])` |

## 树形选择组件 (AreaTreeSelect)

基于 `a-tree-select` 封装，绑定值为**单个地区编码**，适用于选择父级节点等场景。

### 与级联组件的区别

| | SelectArea（级联） | AreaTreeSelect（树形） |
|------|------|------|
| 底层组件 | `a-cascader` | `a-tree-select` |
| 绑定值 | 路径字符串 `"51,5101,510104"` | 单编码 `"510104"` |
| 交互方式 | 列表式逐级展开 | 树形下拉，可搜索 |
| 典型场景 | 选地区作为业务值 | 选父级节点/编码 |

### 基础用法

```vue
<template>
  <area-tree-select v-model="parentCode" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AreaTreeSelect from '@/components/select-area/tree.vue';

// 绑定值为单个地区编码
const parentCode = ref('');
</script>
```

### API

#### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值，单个地区编码 | `string \| undefined` | `undefined` |
| maxLevel | 可选最大层级（1省/2市/3区县/4街道） | `number` | `3` |
| placeholder | 占位提示文本 | `string` | `'请选择上级地区'` |
| defaultExpandAll | 下拉面板打开时是否默认展开全部节点 | `boolean` | `false` |

#### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 值变化时触发 | `(value: string)` |

### 自定义可选层级

通过 `maxLevel` 控制可选深度，超出层级的子节点会被剥离：

```vue
<!-- 仅可选到市级（1-2级） -->
<area-tree-select v-model="cityCode" :max-level="2" />

<!-- 可选到街道（完整4级） -->
<area-tree-select v-model="townCode" :max-level="4" />
```

| maxLevel | 可选范围 | 说明 |
|------|------|------|
| 1 | 仅省级 | 只能选择省/直辖市 |
| 2 | 省、市 | 最多选到市级 |
| 3（默认） | 省、市、区县 | 最多选到区/县 |
| 4 | 省、市、区县、街道 | 完整四级可选 |

### 默认展开全部节点

通过 `default-expand-all` 控制下拉面板打开时是否展开所有节点（默认折叠）：

```vue
<!-- 默认折叠：点击展开按钮逐级展开 -->
<area-tree-select v-model="parentCode" />

<!-- 默认展开：打开面板即显示全部层级 -->
<area-tree-select v-model="parentCode" :default-expand-all="true" />
```

> **提示**：节点数量较多时（如 maxLevel=3 约 3000+ 节点），开启默认展开会产生较多 DOM，建议仅在层级较少（如 maxLevel=2）时启用。

### 在表单中选择上级地区

```vue
<template>
  <a-form>
    <a-form-item label="上级地区" field="parent">
      <area-tree-select v-model="form.parent" :max-level="3" placeholder="留空则为顶级地区" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AreaTreeSelect from '@/components/select-area/tree.vue';

const form = ref({
  parent: ''
});
</script>
```

### 预设默认值

绑定值直接为地区编码，组件自动回显对应中文标签：

```vue
<template>
  <area-tree-select v-model="parentCode" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AreaTreeSelect from '@/components/select-area/tree.vue';

// 预设：成都市（编码 5101）
const parentCode = ref('5101');
</script>
```

## 单选组件示例

### 基础用法

```vue
<template>
  <a-form>
    <a-form-item label="地区选择">
      <select-area v-model="areaCode" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

const areaCode = ref('');
</script>
```

### 带默认值

```vue
<template>
  <select-area v-model="areaCode" placeholder="请选择所在地区" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

// 设置默认值：北京市市辖区
const areaCode = ref('11,1101');
</script>
```

### 监听变化

```vue
<template>
  <select-area 
    v-model="areaCode" 
    @change="handleAreaChange" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';
import type { AreaItem } from '@/api/area';

const areaCode = ref('');

const handleAreaChange = (value: string, selectedOptions: AreaItem[]) => {
  console.log('选中的地区编码:', value);
  console.log('选中的地区信息:', selectedOptions);
  // selectedOptions 示例:
  // [
  //   { value: '11', label: '北京市', level: '1', parent: '' },
  //   { value: '1101', label: '市辖区', level: '2', parent: '11' }
  // ]
};
</script>
```

### 禁用状态

```vue
<template>
  <select-area v-model="areaCode" :disabled="true" />
</template>
```

### 禁用清空

```vue
<template>
  <select-area v-model="areaCode" :clearable="false" />
</template>
```

### 禁用搜索

```vue
<template>
  <select-area v-model="areaCode" :allow-search="false" />
</template>
```

### 强制刷新数据

```vue
<template>
  <select-area ref="areaSelector" v-model="areaCode" />
  <a-button @click="refreshData">刷新数据</a-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

const areaSelector = ref();
const areaCode = ref('');

const refreshData = () => {
  // 清除缓存并重新加载
  areaSelector.value?.clearCache();
  areaSelector.value?.reload();
};
</script>
```

## 数据格式

### 单选组件绑定值格式

单选组件的 `modelValue` 是一个逗号分隔的地区编码字符串：

```
省: "11"
市: "11,1101"
区/县: "11,1101,110101"
乡镇: "11,1101,110101,110101001"
```

### 多选组件绑定值格式

多选组件的 `modelValue` 是一个地区编码数组，每个元素是完整的地区路径：

```typescript
// 示例：选中了北京市市辖区和东城区
['11,1101', '11,1101,110101']

// 示例：选中了多个不同地区的完整路径
['11,1101,110101', '31,3101,310101', '44,4401,440101']
```

**注意**：多选组件的绑定值不需要任何转换，直接使用数组格式。支持四级联动选择（省/市/区/县/乡镇）。

### 树形选择组件绑定值格式

树形选择组件的 `modelValue` 是**单个地区编码**（非路径）：

```
省: "11"
市: "1101"
区/县: "110101"
乡镇: "110101001"
```

### 地区数据结构

```typescript
interface AreaItem {
  value: string;      // 地区编码
  label: string;      // 地区名称
  level: number;      // 级别（1:省/直辖市, 2:市, 3:区/县）
  parent: string;     // 父级编码
  children?: AreaItem[]; // 子级地区
}
```

## 数据源

组件通过 `@/api/area` 的 `getAreaData()` 获取地区数据，内部调用公开接口：

```
GET /api/sysArea/tree
```

数据格式示例：

```json
[
  {
    "value": "11",
    "label": "北京市",
    "level": "1",
    "parent": "",
    "children": [
      {
        "value": "1101",
        "label": "市辖区",
        "level": "2",
        "parent": "11",
        "children": [
          {
            "value": "110101",
            "label": "东城区",
            "level": "3",
            "parent": "1101",
            "children": []
          }
        ]
      }
    ]
  }
]
```

## 缓存机制

组件实现了两级缓存机制：

1. **内存缓存**：首次加载后，数据保存在内存中，后续请求直接返回缓存
2. **Promise 缓存**：防止并发请求，多个组件同时加载时只发起一次请求

如需强制刷新数据，可调用 `clearCache()` 和 `reload()` 方法。

## 多选组件示例

### 基础多选

```vue
<template>
  <select-area v-model="areaCode" placeholder="请选择所在地区" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

// 设置默认值：北京市市辖区
const areaCode = ref('11,1101');
</script>
```

#### 自定义选择级数

```vue
<template>
  <select-area v-model="provinceCode" :level="1" placeholder="请选择省份" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectArea from '@/components/select-area/index.vue';

const provinceCode = ref('');
</script>
```

### 多选组件示例

#### 基础多选

```vue
<template>
  <a-form>
    <a-form-item label="地区选择（可多选）">
      <select-area-multiple v-model="selectedAreas" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectAreaMultiple from '@/components/select-area/multiple.vue';

const selectedAreas = ref<string[]>([]);
</script>
```

#### 带默认值

```vue
<template>
  <select-area-multiple
    v-model="areaCodes"
    placeholder="请选择多个地区"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectAreaMultiple from '@/components/select-area/multiple.vue';

// 设置默认值：北京市市辖区和东城区
const areaCodes = ref<string[]>(['11,1101', '11,1101,110101']);
</script>
```

#### 自定义选择级数

```vue
<template>
  <select-area-multiple
    v-model="cityCodes"
    :level="2"
    placeholder="请选择城市（最多到市级）"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SelectAreaMultiple from '@/components/select-area/multiple.vue';

const cityCodes = ref<string[]>([]);
</script>
```

#### 表单提交

```vue
<template>
  <a-form @submit="handleSubmit">
    <a-form-item label="负责地区" field="areas">
      <select-area-multiple v-model="form.areas" />
    </a-form-item>
    <a-button type="primary" html-type="submit">提交</a-button>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import SelectAreaMultiple from '@/components/select-area/multiple.vue';

const form = ref({
  areas: [] as string[]
});

const handleSubmit = () => {
  console.log('提交的地区数据:', form.value.areas);
  // 输出示例: ['11,1101,110101', '31,3101,310101']
  Message.success('提交成功');
};
</script>
```
## 注意事项

1. 组件依赖后端公开接口 `/api/sysArea/tree` 提供行政区划数据（无需认证）
2. 数据量较大，首次加载可能需要一些时间
3. SelectArea / SelectAreaMultiple 使用 `path-mode` 模式，返回完整的地区路径编码
4. AreaTreeSelect 绑定值为单个地区编码，通过 `maxLevel` 控制可选层级
5. 单选组件绑定值为字符串（逗号分隔），多选组件绑定值为数组，树形组件绑定值为单编码
6. 多选组件的值无需转换，直接使用数组格式即可
7. 三个组件共享同一份全局数据缓存（`getAreaData()`），仅首次加载发起请求
