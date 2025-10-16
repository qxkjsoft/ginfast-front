# GinFast

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5.15-brightgreen.svg" alt="Vue Version">
  <img src="https://img.shields.io/badge/Vite-6.3.5-blue.svg" alt="Vite Version">
  <img src="https://img.shields.io/badge/TypeScript-5.2.2-blue.svg" alt="TypeScript Version">
  <img src="https://img.shields.io/badge/Arco Design-2.57.0-blue.svg" alt="Arco Design Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

> 一个基于 Vue3 + Vite6 + TypeScript + Arco Design 的现代化后台管理模板，开箱即用的企业级中后台解决方案。

## 简介

GinFast 是一个功能完备、高颜值、高性能的后台管理模板，致力于为开发者提供一个稳定、可扩展、易于维护的前端框架。项目采用现代化的技术栈和模块化分层架构，结合 Arco Design UI 组件库，实现了企业级应用所需的各种功能。

### 核心特性

- **现代化技术栈**：Vue3 Composition API + Vite6 + TypeScript + Pinia
- **开箱即用**：内置动态路由、权限控制、多主题、国际化、标签页管理等功能
- **代码规范**：集成 ESLint、Prettier、Stylelint 等工具，确保代码风格统一
- **高性能**：Vite 构建工具提供极速的开发体验和优化的生产构建
- **易扩展**：模块化架构设计，便于功能扩展和维护

## 技术栈

| 类别 | 技术栈 |
|------|--------|
| 前端框架 | Vue3 (Composition API) |
| 构建工具 | Vite 6.x |
| 编程语言 | TypeScript |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由管理 | Vue Router 4.x |
| UI 组件库 | Arco Design Vue 2.57.0 |
| 样式处理 | Sass (sass-embedded), CSS Modules |
| HTTP 请求 | Axios |
| 国际化 | vue-i18n 10.0.0-alpha.3 |
| 代码校验 | ESLint + Stylelint |
| 格式化 | Prettier |
| Git 规范 | husky + lint-staged + commitlint |

## 功能特性

- ✅ **动态路由**：支持前端和后端控制的动态路由生成
- ✅ **权限控制**：RBAC 权限模型，支持菜单权限和按钮权限
- ✅ **多主题**：支持暗黑模式和自定义主题
- ✅ **国际化**：多语言支持（i18n）
- ✅ **标签页管理**：多标签页操作和缓存
- ✅ **页面缓存**：基于 keep-alive 的页面状态保持
- ✅ **Mock 数据**：本地开发 Mock 数据支持
- ✅ **响应式布局**：适配多种屏幕尺寸
- ✅ **SVG 图标**：SVG 图标系统支持
- ✅ **代码规范**：完善的代码规范和提交规范

## 目录结构

```
GinFast/
├── public/                  # 静态资源（不参与打包）
├── src/
│   ├── api/                 # 所有接口请求定义，按模块分类
│   ├── assets/              # 图片、字体等静态资源
│   ├── components/          # 全局通用组件
│   ├── config/              # 全局常量配置
│   ├── directives/          # 自定义指令
│   ├── globals/             # 全局挂载函数或属性
│   ├── hooks/               # Composition API 封装
│   ├── lang/                # 多语言配置
│   ├── layout/              # 主布局组件
│   ├── mock/                # 本地 Mock 数据服务
│   ├── router/              # 路由配置
│   ├── store/               # Pinia 状态管理
│   ├── style/               # 全局样式与 SCSS 变量
│   ├── typings/             # TypeScript 类型声明扩展
│   ├── utils/               # 工具函数库
│   ├── views/               # 页面视图组件
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件
│   └── vite-env.d.ts        # 类型声明
├── build/                   # Vite 构建相关配置
├── .husky/                  # Git 提交钩子
├── .vscode/                 # 推荐编辑器配置
├── env 文件系列             # 环境变量配置
└── 各类 lint 配置文件       # ESLint, Prettier, Stylelint, commitlint 等
```

## 环境要求

- **Node.js**: >= 18.12.0 (推荐 20.12.0+)
- **pnpm**: >= 8.7.0
- **git**: 用于克隆项目代码和版本控制

## 快速开始

### 克隆项目

```bash
# GitHub
git clone https://github.com/WANG-Fan0912/GinFast.git

# 进入项目目录
cd GinFast
```

### 安装依赖

```bash
# 必须使用 pnpm 安装依赖
pnpm install
```

### 开发调试

```bash
# 启动开发服务器
pnpm dev
```

### 构建部署

```bash
# 开发环境构建
pnpm build:dev

# 生产环境构建
pnpm build:prod

# 测试环境构建
pnpm build:test

# 构建后预览
pnpm preview
```

## 项目配置

### 环境变量

项目支持多种环境配置：

- `.env`: 默认环境变量
- `.env.development`: 开发环境变量
- `.env.test`: 测试环境变量
- `.env.production`: 生产环境变量

### 代理配置

在 `vite.config.ts` 中配置开发服务器代理：

```ts
server: {
  proxy: {
    "/api": {
      target: env.VITE_APP_BASE_URL,
      changeOrigin: true
    }
  }
}
```

## 核心模块

### 路由系统

项目采用动态路由机制，支持前端和后端两种控制模式：

- 静态路由：定义在 `src/router/route.ts` 中
- 动态路由：通过 Mock 数据或后端接口动态生成

### 权限控制

实现基于 RBAC 的权限控制模型：

1. **菜单权限**：通过路由配置控制菜单显示
2. **按钮权限**：通过自定义指令 `v-permission` 控制按钮显示

### 状态管理

使用 Pinia 进行全局状态管理，主要模块包括：

- 用户信息：`src/store/modules/user.ts`
- 路由配置：`src/store/modules/route-config.ts`
- 主题配置：`src/store/modules/theme-config.ts`
- 系统配置：`src/store/modules/sys-config.ts`

### 国际化

支持多语言切换，语言包位于 `src/lang/modules/` 目录下。

### 主题系统

支持暗黑模式和自定义主题，配置位于 `src/store/modules/theme-config.ts`。

## 构建优化

项目采用多种构建优化策略：

1. **代码分割**：将大型第三方库单独分包
2. **Tree Shaking**：移除未使用的代码
3. **压缩优化**：生产环境去除 console 和 debugger
4. **资源内联**：小资源内联以减少 HTTP 请求

## 浏览器支持

- 现代浏览器（Chrome, Firefox, Safari, Edge 最近2个版本）
- 不支持 IE 浏览器

## 插件开发规范

项目支持插件化开发，允许开发者通过插件方式扩展系统功能。插件目录位于 `src/plugins/` 下，每个插件作为一个独立的文件夹。

### 插件目录结构

```
plugins/
├── example/                 # 插件示例
│   ├── api/                 # 插件API接口定义
│   ├── store/               # 插件状态管理
│   └── views/               # 插件页面视图
```

### 插件开发步骤

1. **创建插件目录**
   在 `src/plugins/` 目录下创建插件文件夹，建议使用有意义的插件名称。

2. **插件API定义**
   在插件目录下创建 `api/` 文件夹，用于定义插件的接口请求：
   ```typescript
   // src/plugins/[plugin-name]/api/[plugin-name].ts
   import { http } from '@/utils/http';
   import { baseUrlApi } from "@/api/utils";
   import { BaseResult } from "@/api/types";
   
   // 定义数据接口
   export interface ExampleData {
       id: number;
       name: string;
       description: string;
   }
   
   // 定义API请求方法
   export const getExampleList = (params: any) => {
       return http.request<ExampleListResult>("get", baseUrlApi("plugins/example/list"), { params });
   };
   ```

3. **插件状态管理**
   在插件目录下创建 `store/` 文件夹，使用 Pinia 定义插件的状态管理：
   ```typescript
   // src/plugins/[plugin-name]/store/[plugin-name].ts
   import { defineStore } from 'pinia';
   import { ref, computed } from 'vue';
   import { getExampleList } from '../api/example';
   
   export const useExamplePluginStore = defineStore('example-plugin', () => {
       // State
       const dataList = ref<any[]>([]);
       const loading = ref<boolean>(false);
       
       // Getters
       const getDataList = computed(() => dataList.value);
       const isLoading = computed(() => loading.value);
       
       // Actions
       const fetchDataList = async (params?: any) => {
           loading.value = true;
           try {
               const response = await getExampleList(params);
               dataList.value = response.data.list || [];
           } finally {
               loading.value = false;
           }
       };
       
       return {
           // State
           dataList,
           loading,
           
           // Getters
           getDataList,
           isLoading,
           
           // Actions
           fetchDataList
       };
   });
   ```

4. **插件页面视图**
   在插件目录下创建 `views/` 文件夹，开发插件的页面组件：
   ```vue
   <!-- src/plugins/[plugin-name]/views/[view-name].vue -->
   <template>
       <div class="example-plugin-container">
           <a-card title="示例插件列表" :loading="loading">
               <!-- 页面内容 -->
           </a-card>
       </div>
   </template>
   
   <script setup lang="ts">
   import { ref, onMounted } from 'vue';
   import { useExamplePluginStore } from '../store/example';
   import { storeToRefs } from 'pinia';
   
   const exampleStore = useExamplePluginStore();
   const { dataList, loading } = storeToRefs(exampleStore);
   const { fetchDataList } = exampleStore;
   
   onMounted(async () => {
       await fetchDataList();
   });
   </script>
   ```

5. **插件路由配置**
   插件页面会自动被路由系统识别，无需手动配置路由。路由系统会自动扫描 `src/plugins/**/*.vue` 文件并进行动态加载。

6. **插件权限控制**
   插件可以使用系统的权限控制机制，通过 `v-hasPerm` 指令控制按钮权限：
   ```vue
   <a-button v-hasPerm="['plugins:example:add']">新增数据</a-button>
   ```

### 插件开发最佳实践

1. **命名规范**
   - 插件文件夹使用小写字母和连字符分隔，如 `user-management`
   - 插件Store命名使用 `use[PluginName]PluginStore` 格式
   - 插件API文件命名与插件名称保持一致

2. **代码组织**
   - 按功能模块组织代码，保持目录结构清晰
   - 重复使用的组件应提取到 `src/components/` 目录
   - 工具函数应提取到 `src/utils/` 目录

3. **类型安全**
   - 所有接口数据应定义 TypeScript 接口
   - 使用泛型确保API响应类型安全
   - 避免使用 `any` 类型

4. **状态管理**
   - 使用 Pinia 进行状态管理
   - 合理划分 state、getters、actions
   - 使用 `storeToRefs` 解构响应式状态



## 免责声明：
> 1、GIN-FAST仅限自己学习使用，一切商业行为与GIN-FAST无关。

> 2、用户不得利用GIN-FAST从事非法行为，用户应当合法合规的使用，发现用户在使用产品时有任何的非法行为，GIN-FAST有权配合有关机关进行调查或向政府部门举报，GIN-FAST不承担用户因非法行为造成的任何法律责任，一切法律责任由用户自行承担，如因用户使用造成第三方损害的，用户应当依法予以赔偿。

> 3、所有与使用GIN-FAST相关的资源直接风险均由用户承担。