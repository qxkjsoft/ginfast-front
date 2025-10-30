<template>
  <div class="s-logo">
    <img 
      v-if="shouldShowMainImage" 
      :src="imageUrl" 
      :alt="alt" 
      :style="logoStyle" 
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <img 
      v-else-if="shouldShowDefaultImage" 
      :src="defaultImageUrl" 
      :alt="alt" 
      :style="logoStyle"
      @error="handleDefaultImageError"
    />
    <div 
      v-else 
      :style="logoStyle"
      class="logo-fallback"
    >
      Logo
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  // 图片URL
  imageUrl?: string
  // 宽度
  width?: number | string
  // 高度  
  height?: number | string
  // 替代文本
  alt?: string
  // 默认图片URL
  defaultImageUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  width: 32,
  height: 32,
  alt: '系统logo',
  defaultImageUrl: '/src/assets/sys/default.svg'
})

// 图片加载状态
const imageLoadFailed = ref(false)
const defaultImageLoadFailed = ref(false)

// 检查是否应该显示主图片
const shouldShowMainImage = computed(() => {
  return props.imageUrl && 
         props.imageUrl.trim() !== '' && 
         !imageLoadFailed.value
})

// 检查是否应该显示默认图片
const shouldShowDefaultImage = computed(() => {
  return !defaultImageLoadFailed.value
})

// 处理主图片加载成功
const handleImageLoad = () => {
  imageLoadFailed.value = false
}

// 处理主图片加载错误
const handleImageError = () => {
  console.warn(`主Logo图片加载失败: ${props.imageUrl}`)
  imageLoadFailed.value = true
}

// 处理默认图片加载错误
const handleDefaultImageError = () => {
  console.error('默认Logo图片也加载失败')
  defaultImageLoadFailed.value = true
}

// 计算logo样式
const logoStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (typeof props.width === 'number') {
    style.width = `${props.width}px`
  } else {
    style.width = props.width
  }
  
  if (typeof props.height === 'number') {
    style.height = `${props.height}px`
  } else {
    style.height = props.height
  }
  
  return style
})
</script>

<style lang="scss" scoped>
.s-logo {
  display: inline-block;
  vertical-align: middle;
  
  img {
    display: block;
    border: none;
    outline: none;
    border-radius: 4px;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 0.8;
    }
    
    &:active {
      opacity: 0.6;
    }
  }
  
  .logo-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    color: #666;
    font-size: 12px;
    font-weight: bold;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
  }
}
</style>
