# S-Logo 组件使用说明

## 组件介绍

S-Logo 是一个灵活的系统logo图标组件，支持传入图片URL、宽度和高度参数。当传入的图片URL无效时，会自动使用默认图片作为fallback。

## 功能特性

- ✅ 支持自定义图片URL
- ✅ 支持自定义宽度和高度（数字或字符串）
- ✅ 自动fallback机制：当主图片加载失败时使用默认图片
- ✅ 支持alt文本自定义
- ✅ 支持自定义默认图片URL
- ✅ 优雅的错误处理和加载状态管理
- ✅ 响应式设计，支持hover效果

## 基本用法

### 1. 基础用法

```vue
<template>
  <!-- 使用默认尺寸(32x32) -->
  <s-logo :image-url="logoUrl" />
</template>
```

### 2. 自定义尺寸

```vue
<template>
  <!-- 自定义宽度和高度 -->
  <s-logo 
    :image-url="logoUrl" 
    :width="64" 
    :height="64" 
  />
  
  <!-- 使用字符串尺寸 -->
  <s-logo 
    :image-url="logoUrl" 
    width="120px" 
    height="80px" 
  />
</template>
```

### 3. 自定义文本和默认图片

```vue
<template>
  <s-logo 
    :image-url="customLogoUrl"
    :width="48"
    :height="48"
    alt="自定义Logo"
    :default-image-url="customDefaultUrl"
  />
</template>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `imageUrl` | string | `''` | 主图片URL地址 |
| `width` | number \| string | `32` | 图片宽度（像素值或CSS字符串） |
| `height` | number \| string | `32` | 图片高度（像素值或CSS字符串） |
| `alt` | string | `'系统logo'` | 图片替代文本 |
| `defaultImageUrl` | string | `'/src/assets/sys/default.svg'` | 默认图片URL |

## Fallback 机制

组件按照以下优先级显示图片：

1. **主图片**: 当 `imageUrl` 有效且加载成功时显示
2. **默认图片**: 当主图片无效或加载失败时显示
3. **文字fallback**: 当所有图片都加载失败时显示"Logo"文字

## 示例代码

### 在页面中使用

```vue
<template>
  <div class="demo-container">
    <h3>S-Logo 组件示例</h3>
    
    <div class="logo-row">
      <h4>基础用法 (32x32)</h4>
      <s-logo :image-url="validLogoUrl" />
    </div>
    
    <div class="logo-row">
      <h4>自定义尺寸 (64x64)</h4>
      <s-logo 
        :image-url="largeLogoUrl" 
        :width="64" 
        :height="64" 
      />
    </div>
    
    <div class="logo-row">
      <h4>无效URL测试（会使用默认图片）</h4>
      <s-logo :image-url="invalidLogoUrl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 有效的logo URL
const validLogoUrl = ref('/src/assets/logo/snow.svg')

// 大尺寸logo URL
const largeLogoUrl = ref('/src/assets/img/logo.jpg')

// 无效的logo URL（会触发fallback）
const invalidLogoUrl = ref('/invalid/path/logo.png')
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.logo-row {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-row h4 {
  margin: 0;
  width: 200px;
}
</style>
```

### 在组件注册中使用

```typescript
// main.ts 或相关组件中
import SLogo from '@/components/s-logo/index.vue'

app.component('SLogo', SLogo)
```

## 注意事项

1. **路径问题**: 确保图片路径正确，建议使用相对路径或绝对URL
2. **CORS问题**: 如果使用外部URL，请确保服务器支持跨域访问
3. **加载性能**: 建议使用适当大小的图片以优化加载性能
4. **可访问性**: 建议为logo设置有意义的alt文本

## 错误处理

组件会在浏览器控制台输出警告信息：
- 主图片加载失败时：`主Logo图片加载失败: [URL]`
- 默认图片加载失败时：`默认Logo图片也加载失败`

所有图片都加载失败时，会显示一个带有"Logo"文字的fallback框。

## 样式自定义

可以通过CSS覆盖组件样式：

```css
.s-logo img {
  border-radius: 8px; /* 更大的圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.s-logo .logo-fallback {
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  border: 2px solid #ccc;
}
