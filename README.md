# MQMDOG OA Frontend

基于 Vue 3 和 Element Plus 构建的企业办公自动化系统前端

## 项目简介

MQMDOG OA Frontend 是一个现代化的企业办公自动化系统前端，采用 Vue 3、Vite、Element Plus、Pinia 等前沿技术栈构建。系统提供了完整的 OA 功能，包括员工管理、考勤管理、通知管理等模块，支持多角色权限控制。

## 功能特性

- **响应式设计**: 适配不同屏幕尺寸
- **权限管理**: 支持员工、主管、董事会成员等多角色权限控制
- **模块化架构**: 清晰的功能模块划分
- **现代化UI**: 基于 Element Plus 的美观界面
- **状态管理**: 使用 Pinia 进行全局状态管理
- **路由守卫**: 完善的登录验证和权限控制

## 技术栈

- **核心框架**: Vue 3
- **构建工具**: Vite 5
- **UI 框架**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **富文本编辑器**: WangEditor for Vue

## 功能模块

- **首页**: 个人信息展示和系统概览
- **考勤管理**:
  - 个人考勤记录
  - 下属考勤管理 (主管/董事会权限)
- **通知管理**:
  - 通知发布 (主管/董事会权限)
  - 通知列表和详情
- **员工管理**:
  - 员工列表 (主管/董事会权限)
  - 新增员工 (主管/董事会权限)

## 权限说明

- **普通员工**: 可访问首页、个人考勤、通知列表
- **主管**: 可访问下属考勤、发布通知
- **董事会成员**: 可访问所有管理功能

## 项目结构

```
src/
├── api/              # API 请求封装
├── assets/           # 静态资源
├── components/       # 公共组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── utils/            # 工具函数
└── views/            # 页面视图
```

## 安装部署

### 环境要求

- Node.js >= 16.x
- npm 或 yarn

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/mqmdog/MQMDOG-Vue3.git
cd MQMDOG-Vue3

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 环境配置

项目支持开发和生产环境配置，相关配置文件位于：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

主要配置项包括 API 基础路径等。

## API 接口

项目集成了多个 API 模块：


## 组件库

项目使用 Element Plus 作为 UI 组件库，并自定义了一些业务组件：

- `OADialog.vue` - 对话框组件
- `OAPageHeader.vue` - 页面头部组件
- `OAPagenation.vue` - 分页组件
- `OAmain.vue` - 主框架组件

## 开发规范

- 代码风格遵循 ESLint 和 Prettier 规范
- 使用 Vue 3 Composition API
- 组件命名采用 PascalCase
- 路由命名采用 kebab-case

