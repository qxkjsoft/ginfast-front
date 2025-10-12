# 插件目录规范

## 目录结构

所有插件相关的代码都应统一存放在 `src/plugins` 目录下，每个插件拥有独立的子目录。

```
src/
├── plugins/
│   ├── plugin-name/
│   │   ├── api/           # 插件的 API 接口封装
│   │   ├── store/         # 插件的状态管理模块
│   │   └── views/         # 插件的页面视图组件
│   └── ...
```

## 插件规范

1. **插件命名**：插件目录应使用小写字母和连字符命名，如 `example-plugin`
2. **API 模块**：每个插件的 API 接口应封装在 `api/index.ts` 文件中
3. **Store 模块**：每个插件的状态管理应定义在 `store/index.ts` 文件中
4. **Views 模块**：每个插件的页面组件应放在 `views/` 目录下

## 示例插件

请参考 `example-plugin` 目录中的实现：
- `api/index.ts`：API 接口封装示例
- `store/index.ts`：状态管理示例
- `views/ExampleList.vue`：页面组件示例

## 开发新插件

创建新插件时，请遵循以下步骤：

1. 在 `src/plugins` 目录下创建插件目录
2. 在插件目录下创建 `api`、`store`、`views` 子目录
3. 按照示例插件的结构和规范实现功能