# Ops Assistant Client

智能运维问答助手 - Vue 3 前端

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia (状态管理)
- ESLint (代码检查)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

前端将运行在 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境配置

在 `.env` 文件中配置后端 API 地址：

```env
VITE_API_BASE_URL=http://127.0.0.1:8012
```

## 项目结构

```
src/
├── components/          # 组件
│   ├── AskForm.vue     # 问答表单
│   ├── DataSourceCard.vue  # 数据源状态卡片
│   └── ResultCard.vue  # 结果展示卡片
├── services/           # API 服务层
│   └── api.ts          # 后端 API 调用封装
├── views/              # 页面视图
│   └── HomeView.vue    # 首页
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 功能特性

### 数据源状态监控

- 实时显示知识库、指标、公共标签的加载状态
- 显示文件路径和加载数量
- 自动检测文件是否存在

### 智能问答

- 支持自然语言问题输入
- 可选省份筛选
- 可配置返回结果数量
- 实时问答结果展示

### 结果展示

- 识别的指标名称
- 置信度评分（带颜色区分）
- 问题可能原因
- 建议处理步骤
- 后续动作建议
- 匹配的知识条目详情

## API 接口

所有 API 调用都封装在 `src/services/api.ts` 中：

### 健康检查

```typescript
api.health()
```

### 数据源状态

```typescript
api.dataSourceStatus()
```

### 问答查询

```typescript
api.ask({
  question: '问题描述',
  province: '浙江',  // 可选
  top_k: 3          // 可选
})
```

## 开发指南

### 添加新组件

1. 在 `src/components/` 创建 `.vue` 文件
2. 使用 TypeScript 和 `<script setup>` 语法
3. 添加适当的 Props 类型定义

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由配置

### 调用后端 API

1. 在 `src/services/api.ts` 中定义类型和方法
2. 在组件中导入并使用

示例：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { api, type AskRequest } from '@/services/api'

const result = ref(null)

const handleSubmit = async (data: AskRequest) => {
  result.value = await api.ask(data)
}
</script>
```

## 与后端联调

### 确保后端服务运行

```bash
cd ../ops-assistant-fastapi
./start.sh
```

后端运行在 http://127.0.0.1:8012

### CORS 配置

后端已配置允许来自 `http://localhost:5173` 的跨域请求。

如果需要修改端口，需要同步更新：
1. 后端 `app/main.py` 中的 CORS 配置
2. 前端 `.env` 中的 API 地址

## 常见问题

### Q: API 调用失败，出现 CORS 错误

A: 确保后端已启动且 CORS 中间件已配置。检查浏览器控制台的详细错误信息。

### Q: 数据源状态显示"加载失败"

A: 检查后端服务是否正常运行：

```bash
curl http://127.0.0.1:8012/api/v1/health
```

### Q: 如何修改 API 地址

A: 编辑 `.env` 文件中的 `VITE_API_BASE_URL`，然后重启开发服务器。

### Q: 生产环境如何部署

A: 

1. 构建生产版本：`npm run build`
2. 将 `dist/` 目录部署到静态服务器（Nginx、Apache 等）
3. 配置反向代理或修改 API 地址指向生产后端

## License

Internal use only.
