# Nimbus Blog Web

Nimbus Blog 的前端应用，包含前台站点与后台管理界面，基于 Next.js App Router 构建。

## 目录

- 概览
- 功能模块
- 技术栈
- 架构与约定
- 快速开始（本地开发）
- 配置（环境变量）
- 常用脚本
- API 前缀与鉴权
- 部署提示

## 概览

- 路由分区：前台 `(site)` 与后台 `admin/(dashboard)`（后台登录页 `/admin/login` 不受保护）
- 数据来源：站点名称/描述/社交链接等动态信息来自后端 `site_settings`
- API 分区：
  - Public V1：`/api/v1/*`（公开接口；部分写操作需要 `Authorization: Bearer <token>`）
  - Admin：`/api/admin/*`（Session Cookie）
- RSS：`/rss.xml` 使用 Route Handler 在服务端动态生成（依赖 `NEXT_PUBLIC_API_BASE`）

更完整的目录结构、API 约定与实现细节详见 [CONVENTIONS.md](./CONVENTIONS.md)。

## 功能模块

- 前台：首页、博客列表、文章详情、分类、标签、归档、关于、友链、帮助与反馈、用户设置、RSS
- 后台：登录、仪表盘、文章管理、用户管理、评论管理、反馈管理、通知管理、友链管理、文件管理、安全设置、站点设置

## 技术栈

（以 [package.json](./package.json) 为准）

- 框架：Next.js 16.1.6（App Router + Turbopack）
- 语言：TypeScript 5.6.3
- UI：HeroUI v2 + Tailwind CSS 4
- 动画：Framer Motion 11
- 内容：
  - 后台编辑：MDXEditor
  - 前台渲染：next-mdx-remote（统一序列化：remark-gfm + rehype-pretty-code）
- 包管理与规范：pnpm、ESLint 9（Flat Config）、Prettier

## 架构与约定

- App Router：以 `app/` 为路由入口，使用 Route Group 分离站点与后台
- API 层：`lib/api/`
  - `adminRequest`：Admin API（Session Cookie）
  - `userRequest`：V1 API（可选 Bearer Token）
  - Route Handler（如 RSS）不复用请求封装，直接 `fetch`（避免浏览器态逻辑）
- 站点设置：前台组件在运行时拉取 settings，避免构建期依赖后端

## 快速开始（本地开发）

### 1) 安装依赖

```bash
pnpm i
```

### 2) 配置环境变量

在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

其中 `http://localhost:8080` 为后端服务地址（示例）。

### 3) 启动开发服务器

```bash
pnpm dev
```

访问：
- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin/login`

## 配置（环境变量）

### NEXT_PUBLIC_API_BASE

- 说明：后端 API 基础地址（自动去掉末尾 `/`）
- 用途：API 请求与 `/rss.xml` Route Handler 的服务端 fetch
- 要求：建议始终使用绝对地址；并且需要在 `pnpm build` 之前设置（`NEXT_PUBLIC_*` 会在构建期内联）

## 常用脚本

- `pnpm dev`：启动开发服务器（Turbopack）
- `pnpm build`：构建生产包
- `pnpm start`：启动生产服务
- `pnpm lint`：执行 ESLint 并自动修复可修复项（`eslint --fix`）

## API 前缀与鉴权

- 路由前缀：
  - Public V1：`/api/v1/*`
  - Admin：`/api/admin/*`
- 鉴权方式（与后端保持一致）：
  - Admin：Session Cookie
  - User：`Authorization: Bearer <token>`（前端在浏览器端维护 token；部分接口为可选鉴权）

## 部署提示

- 生产环境建议通过反向代理统一站点域名：
  - 前端：Next.js
  - 后端：`/api/*` 反代到 API 服务
  - 文件：如使用 MinIO，建议同域 `/minio/*` 反代，避免跨域与混合内容
- 若需要生成 RSS 或使用服务端请求，请确保构建时设置了正确的 `NEXT_PUBLIC_API_BASE`
