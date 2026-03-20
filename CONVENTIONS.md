# 前端项目规范（nimbus-blog-web）

## 一、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.1.6（App Router + Turbopack） |
| 运行时 | React 19.2.4 |
| 语言 | TypeScript 5.6.3 |
| UI 库 | HeroUI v2 |
| 样式 | Tailwind CSS 4 |
| 动画 | Framer Motion 11 |
| 包管理 | pnpm |
| 代码规范 | ESLint 9（Flat Config） + Prettier |
| MDX 渲染 | next-mdx-remote 6 + rehype-pretty-code（Shiki，高亮在序列化阶段生成） |
| RSS 生成 | feed 5（服务端 Route Handler 动态输出 RSS 2.0 XML） |

## 二、目录结构

```
nimbus-blog-web/
├── app/                       # Next.js App Router 路由层
│   ├── layout.tsx             # 根 Layout（Providers 包裹）
│   ├── providers.tsx          # 全局 Provider（HeroUI / Theme / 条件 UserAuth）
│   ├── error.tsx              # 全局错误边界
│   ├── (site)/                # 前台路由分组（不影响 URL）
│   │   ├── layout.tsx         # 前台 Layout（Navbar + Footer）
│   │   ├── blog/              # /blog 博客列表
│   │   │   ├── layout.tsx     # 列表页布局（筛选/统计等统一样式）
│   │   │   └── page.tsx
│   │   ├── post/[slug]/       # /post/:slug 文章详情
│   │   ├── categories/        # /categories 分类
│   │   ├── tags/              # /tags 标签
│   │   ├── archive/           # /archive 归档
│   │   ├── about/             # /about 关于
│   │   ├── links/             # /links 友情链接
│   │   ├── help/              # /help 帮助与反馈
│   │   ├── privacy/           # /privacy 隐私政策
│   │   ├── terms/             # /terms 服务条款
│   │   └── settings/          # /settings 用户设置
│   ├── rss.xml/               # RSS 订阅（Route Handler，服务端动态生成 XML）
│   │   └── route.ts
│   └── admin/                 # 后台路由
│       ├── login/             # /admin/login 管理员登录（无 Layout 保护）
│       └── (dashboard)/       # 受认证保护的 Route Group
│           ├── layout.tsx     # Admin Layout（Session 校验 + Sidebar + Header）
│           ├── posts/         # 文章管理（列表/新建/编辑/分类标签）
│           ├── users/         # 用户管理
│           ├── comments/      # 评论管理
│           ├── feedbacks/     # 反馈管理
│           ├── notifications/ # 通知管理（向用户发送站内通知）
│           ├── links/         # 友链管理
│           ├── files/         # 文件管理
│           ├── security/      # 安全设置（个人信息/密码/2FA）
│           └── settings/      # 站点设置
├── components/                # 组件层
│   ├── admin/                 # 后台专属组件
│   │   ├── layout/            # Sidebar、Header（Barrel export via index.ts）
│   │   ├── editor/            # MDX 编辑器（ForwardRefEditor、InitializedMDXEditor）
│   │   └── posts/             # 文章相关组件（PostForm）
│   ├── common/                # 通用组件
│   │   ├── icons/             # SVG 图标组件（Barrel export via index.ts）
│   │   ├── utility/           # ThemeSwitch、ScrollToTopButton、TruncatedText（省略文本悬停显示）（Barrel export via index.ts）
│   │   └── primitives.ts      # Tailwind Variants 复用变体（title、subtitle）
│   └── site/                  # 前台专属组件
│       ├── auth/              # 用户认证（UserAuth、AuthMenu）
│       │   └── forms/         # 表单组件（LoginForm、SignupForm、ForgotForm）
│       ├── layout/            # Navbar、Footer（Barrel export via index.ts）
│       ├── notification/      # 站内通知（NotificationBell）（Barrel export via index.ts）
│       └── post/              # 文章相关组件（Barrel export via index.ts）
│           ├── ArticleCard.tsx       # 文章摘要卡片（博客/分类/标签列表复用，is_featured=true 显示“置顶”标签）
│           ├── Comments.tsx
│           ├── TableOfContents.tsx
│           ├── MobileTableOfContents.tsx
│           ├── MDXContent.tsx
│           └── MDXComponents.tsx
├── config/                    # 静态配置（仅前端路由/UI 配置，不含动态站点信息）
│   └── site.ts                # 导航项、RSS/邮箱链接
├── context/                   # React Context
│   ├── user-auth.tsx          # 用户认证状态（login/register/refresh/logout）
│   ├── notification.tsx       # 站内通知状态（SSE 连接 / 未读数量）
│   └── index.ts               # Barrel export
├── lib/                       # 工具库
│   ├── api/                   # API 请求层
│   └── mdx/                   # MDX 相关共享工具
│       ├── toc.ts             # TOC 解析共享工具函数（供 TableOfContents/MobileTOC 复用）
│       └── content.ts         # MDX 正文规范化与统一序列化（frontmatter 处理 + gfm + rehype）
├── scripts/                   # 脚本与工具
│   └── gen-logo.mjs           # 生成 Logo/素材的辅助脚本（可选）
├── styles/                    # 全局样式
│   ├── globals.css            # 全局 CSS
│   ├── markdown.css           # Markdown/MDX 正文样式（.markdown-content）
│   └── mdx-editor-heroui.css  # MDX 编辑器 HeroUI 主题适配
├── types/                     # 全局类型定义
│   └── index.ts               # IconSvgProps 等通用类型
└── public/                    # 静态资源
```

## 三、路径别名

项目配置了 `@/*` → 项目根目录的路径映射。

```ts
import { userRequest } from "@/lib/api/http";
import type { V1PostDetail } from "@/lib/api/types";
```

## 四、API 层规范（`lib/api/`）

### 4.1 文件组织

```
lib/api/
├── envelope.ts          # 统一响应信封 ApiEnvelope<T> 和 ApiError
├── http.ts              # 底层请求函数 adminRequest / userRequest，Token 管理
├── types.ts             # 所有共享 DTO 类型（响应类型、域模型）
├── admin/               # Admin 后台接口
│   ├── auth.ts          # 认证（登录、登出、个人信息查看/修改、修改密码、2FA）
│   ├── file.ts          # 文件管理（列表、上传URL+元数据、删除+元数据清理、直传MinIO）
│   ├── user.ts          # 用户管理（列表、状态变更）
│   ├── content.ts       # 内容管理（文章、分类、标签 CRUD、Slug 生成）
│   ├── comment.ts       # 评论管理（列表、状态变更、删除）
│   ├── feedback.ts      # 反馈管理（列表、详情、状态变更、删除）
│   ├── link.ts          # 友链管理（CRUD）
│   ├── notification.ts  # 通知管理（向用户发送通知）
│   └── setting.ts       # 站点设置（列表、查询、upsert）
└── v1/                  # V1 公开接口
    ├── auth.ts          # 用户认证（注册、登录、刷新、登出）
    ├── captcha.ts       # 验证码
    ├── email.ts         # 邮件验证码
    ├── user.ts          # 用户个人信息
    ├── content.ts       # 公开内容（文章列表、分类、标签）
    ├── comment.ts       # 公开评论
    ├── feedback.ts      # 公开反馈提交
    ├── link.ts          # 公开友链
    ├── notification.ts  # 站内通知（列表、未读数、标记已读、删除）
    ├── file.ts          # 公开文件（key→URL 转换）
    └── setting.ts       # 公开站点设置（listSettings + fetchSettingsMap）
```

**Admin 2FA（两阶段启用）**
- `POST /api/admin/auth/2fa/setup`：请求体 `{}`，返回 `setup_id`、`secret`、`qrcode_image_base64`；此阶段仅用于“在 Authenticator 里添加条目”，不会生成恢复码
- `POST /api/admin/auth/2fa/verify`：请求体 `{ setup_id, code }`；成功后返回 `recovery_codes`，并要求重新登录（后端会销毁会话）
- `/admin/security` 页面在“验证成功”后必须引导用户先保存恢复码（复制/导出），再点击“确定并重新登录”
- `POST /api/admin/auth/2fa/recovery/reset`：请求体 `{ code | recovery_code }`；成功后返回新的 `recovery_codes`，前端必须展示并引导用户重新保存（复制/导出），但不强制重新登录
- `/admin/security` 页面在“展示恢复码”状态下也应保留“生成/刷新 2FA 配置”与“关闭 2FA / 重置恢复码”入口，避免重置后无法继续操作
- `GET /api/admin/auth/profile`：返回 `AdminProfileDTO`，包含 `twofa_enabled` 字段，用于前端判断是否显示“关闭 2FA / 重置恢复码”模块

### 4.2 命名规则

| 类别 | 规则 | 示例 |
|------|------|------|
| 文件名 | 按领域命名，无前缀（目录区分 admin/v1） | `admin/content.ts`, `v1/auth.ts` |
| 请求体类型 | `{Action}Body`，无 admin/user 前缀 | `CreatePostBody`, `LoginBody` |
| 查询参数类型 | `{List}Query` | `ListPostsQuery`, `ListUsersQuery` |
| 响应 DTO 类型 | `{Name}DTO` 或领域名称 | `CaptchaDTO`, `V1PostSummary`, `UserProfile` |
| API 函数 | camelCase 动词开头，无 admin/user 前缀 | `listPosts`, `login`, `getMe` |
| 缩写 | 2FA 在函数名中使用 `twoFA*` 前缀 | `twoFASetup`, `twoFAVerify` |

### 4.3 Admin vs V1 分离

- **Admin** 接口放 `admin/` 子目录，使用 `adminRequest`（Session Cookie）
- **V1** 公开接口放 `v1/` 子目录，使用 `userRequest`（JWT Bearer）
- 共享基础设施（`envelope.ts`、`http.ts`、`types.ts`）放在 `lib/api/` 根目录
- 函数和类型名无需加 `admin` / `user` 前缀，由导入路径区分：

```ts
// 通过路径区分，函数名保持简洁
import { login } from "@/lib/api/admin/auth";   // admin login
import { login } from "@/lib/api/v1/auth";      // user login

// 若同时需要两个，用别名
import { login as adminLogin } from "@/lib/api/admin/auth";
import { login as userLogin } from "@/lib/api/v1/auth";
```

### 4.4 请求函数模式

```ts
// v1/link.ts — 无认证 GET
import type { LinkDetail } from "../types";
import { userRequest } from "../http";

export async function listLinks(): Promise<LinkDetail[]> {
  return userRequest<LinkDetail[]>("/links", { method: "GET" });
}

// v1/comment.ts — 可选认证 GET（like 字段需要 JWT）
export async function listComments(
  postId: number,
): Promise<CommentBasic[]> {
  return userRequest<CommentBasic[]>(
    `/content/posts/${postId}/comments`,
    { method: "GET" },
    true,   // withAuth: 传递 JWT 以获取 like 点赞状态
  );
}

// v1/comment.ts — 带认证 POST
export async function submitComment(
  postId: number,
  body: SubmitCommentBody,
): Promise<CreateResultDTO> {
  return userRequest<CreateResultDTO>(
    `/content/posts/${postId}/comments`,
    { method: "POST", body },
    true,   // withAuth
  );
}

// admin/content.ts — Admin 分页 GET
import { adminRequest } from "../http";

export async function listPosts(
  query?: ListPostsQuery,
): Promise<Page<AdminPostSummary>> {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.page_size) params.set("page_size", String(query.page_size));
  if (query?.status) params.set("filter.status", query.status);
  const qs = params.toString();
  return adminRequest<Page<AdminPostSummary>>(
    `/content/posts${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}
```

### 4.5 类型组织原则

- **共享 DTO** 全部放在 `lib/api/types.ts`，用注释分区（Pagination / Auth / Content / Comment / ...）
- **请求体类型**（`Body`）和 **查询参数类型**（`Query`）放在各自模块文件内（`admin/*.ts` 或 `v1/*.ts`）
- 子目录文件通过 `../types` 和 `../http` 引用共享模块
- 后端 JSON 字段统一使用 `snake_case`，TypeScript 类型属性保持与 JSON 一致
- 可空字段使用 `string | null`，可选字段使用 `?`

### 4.6 文件上传规范

**上传流程：** 前端请求 Presigned URL → 直传 MinIO → 后端保存元数据到 `files` 表。

**`upload_type` 与 Object Key 路径对应关系：**

| `upload_type` | Object Key 格式 | 说明 |
|---------------|-----------------|------|
| `avatar` | `avatars/{uuid}.ext` | 头像 |
| `post_cover` | `posts/covers/{uuid}.ext` | 文章封面 |
| `post_content` | `posts/content/{uuid}.ext` | 文章内容图片 |

**注意事项：**

- 路径不嵌入 `resource_id`，资源绑定由后端 `files` 表 `resource_id` 字段管理
- `generateUploadURL` 必传 `file_name` 和 `file_size`，`resource_id` 为可选
- 新建文章场景下上传封面无需传 `resource_id`，文章创建后由后端 `BindResource` 绑定
- 显示图片时，使用 V1 `getFileURL(key)` 获取临时访问 URL
- `upload_url` 为后端返回的可 PUT 地址（通常建议走同域 `/minio/` 反代，避免跨域与混合内容）
- 生产环境建议在 Nginx 配置同域代理：
  ```
  location /minio/ {
    proxy_pass http://127.0.0.1:9000/;
    proxy_set_header Host minio-server:9000;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    client_max_body_size 10m;
  }
  ```

### 4.7 图片 URL 解析

`v1/file.ts` 提供两个工具函数：

| 函数 | 说明 |
|------|------|
| `getFileURL(key)` | 将 MinIO object key 转为 `API_BASE + /api/v1/files/{key}` 访问地址 |
| `resolveImageURL(value)` | 智能解析：以 `/` 或 `http` 开头直接使用（本地静态文件或外部 URL），否则走 `getFileURL` |

**使用场景：**
- 上传到 MinIO 的文件（如文章封面 `posts/covers/xxx.webp`）→ 用 `getFileURL`
- site_settings 中的图片路径（可能是 `/author.png` 本地文件，也可能是 MinIO key）→ 用 `resolveImageURL`
- Route Handler（如 RSS）场景：以 `/` 开头统一拼接 `siteUrl(origin)` 生成绝对地址；MinIO object key 转为 `API_BASE + /api/v1/files/{key}`；以 `http` 开头直接使用
- V1 `/api/v1/files/{key}` 会返回 307 重定向到实际文件地址；当 `API_BASE` 与站点同域时，Next.js 图片无需额外配置；跨域场景需在 `next.config.js` 中声明允许来源

### 4.8 分页约定

后端分页响应格式：

```ts
interface Page<T> {
  list: T[];
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
```

前端分页器展示规则：
- 所有使用 HeroUI `Pagination` 的列表页，默认**始终显示分页器**（即使 `total_pages <= 1`）
- 当后端返回 `total_pages` 为 `0` 时，前端渲染时将 `total` 归一化为 `1`，避免分页组件异常

查询参数命名（snake_case）：

| 参数 | 说明 |
|------|------|
| `page` | 页码 |
| `page_size` | 每页数量 |
| `sort_by` | 排序字段 |
| `order` | 排序方向：`asc` / `desc` |
| `keyword` | 关键词搜索 |
| `filter.status` 等 | 过滤条件 |
 
Admin 列表默认每页数量：10 条（文章/用户/评论/反馈/文件）

Admin 列表页使用 HeroUI `Table` 的 `sortDescriptor` + `onSortChange` 实现可点击表头排序：

```tsx
const [sortBy, setSortBy] = useState("created_at");
const [sortOrder, setSortOrder] = useState<"ascending" | "descending">("descending");

<Table
  sortDescriptor={{ column: sortBy, direction: sortOrder }}
  onSortChange={(d) => { setSortBy(d.column as string); setSortOrder(d.direction!); setPage(1); }}
>
  <TableColumn key="created_at" allowsSorting>时间</TableColumn>
```

各实体默认排序及可排序字段：

| 页面 | 默认排序 | 可排序列 |
|------|----------|----------|
| 文章 | `created_at desc` | 浏览、点赞、发布时间 |
| 评论 | `created_at desc` | 时间 |
| 用户 | `created_at desc` | 注册时间 |
| 反馈 | `created_at desc` | 时间 |
| 友链 | `sort_order asc` | 名称、排序 |
| 文件 | `created_at desc` | 大小、上传时间 |
| 分类/标签 | `created_at desc` | （卡片/Chip 布局，无表头排序） |

### 4.9 搜索交互规范

列表页的关键词搜索采用「双状态 + 回车触发」模式，避免每次按键都触发 API 请求：

```tsx
const [keyword, setKeyword] = useState("");           // 输入框绑定值
const [activeKeyword, setActiveKeyword] = useState(""); // 实际传给 API 的值

const fetchData = useCallback(async () => {
  await listXxx({ keyword: activeKeyword || undefined, ... });
}, [activeKeyword, page, ...]);

const triggerSearch = () => { setActiveKeyword(keyword); setPage(1); };
```

**触发搜索**的方式：
- **回车键** — `onKeyDown={(e) => e.key === "Enter" && triggerSearch()}`
- **清除按钮** — `isClearable` + `onClear` 同时重置 `keyword` 和 `activeKeyword`

**搜索框样式**：
- `startContent={<SearchIcon />}` — 左侧搜索图标
- `endContent={<Kbd keys={["enter"]} />}` — 右侧回车快捷键提示
- Admin 页：`className="sm:max-w-xs"` 限制宽度，不占满整行
- 分类/标签页：`className="max-w-sm"` 固定适当宽度

```tsx
<Input
  isClearable
  className="sm:max-w-xs"
  placeholder="搜索..."
  startContent={<SearchIcon className="text-default-400" />}
  endContent={<Kbd keys={["enter"]} />}
  value={keyword}
  onValueChange={setKeyword}
  onClear={() => { setKeyword(""); setActiveKeyword(""); setPage(1); }}
  onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
/>
```

### 4.10 响应信封

所有 API 响应被 `ApiEnvelope<T>` 包装，`http.ts` 中的 `doFetch` 自动解包 `data` 字段：

```ts
interface ApiEnvelope<T> {
  code: string;     // "0000" 表示成功
  message: string;
  data?: T;
}
```

业务层直接拿到 `T`，无需手动解包。`doFetch` 内部通过 `json.code !== "0000"` 判断是否成功。

### 4.11 列表封面占位与比例

- 文章封面为空时统一使用占位图 `/no_cover_yet.png`（位于 `public/`）
- 列表与首页卡片封面容器使用 `aspect-video`，图片使用 `object-cover object-center` 全覆盖
- 路径解析遵循 4.7：有 `featured_image` 用 `getFileURL`；无则直接使用本地静态路径

### 4.12 Admin 封面编辑区域

- 预览容器使用 `relative rounded-lg overflow-hidden`
- 预览图使用 `pointer-events-none select-none w-full h-32 object-cover`
- 操作按钮（移除/更换）用绝对定位覆盖：`absolute top-1 right-1 z-10 min-w-0 h-6 px-2`
- 目标：保证按钮不被预览图遮挡，点击可用，移动端可点击区域明确

### 4.13 头像默认值与来源

- 登录用户头像默认值：`/avatar.png`（位于 `public/`），当 `user.avatar` 为空时前端使用该本地占位
- 作者（博主）头像默认值：`/author.png`（位于 `public/`），当后端 `profile.avatar` 为空时前端使用该本地占位
- 站点设置中的头像路径解析：先用 `resolveImageURL(profile.avatar)`，若为空则回退 `/author.png`
- 用户头像来源：`user.avatar` 返回绝对 URL 或以 `/` 开头的静态路径；为空时回退 `/avatar.png`

**管理员站点设置头像上传：**
- 管理后台「站点设置 → 博主信息」提供「上传头像」按钮
- 前端调用 Admin `POST /api/admin/files/upload-url` 生成预签名 URL（`upload_type=avatar`）
- 浏览器用 `PUT` 直传文件到同域 `/minio/...`，成功后将 `object_key` 写入 `profile.avatar`
- 前台展示使用 `resolveImageURL(profile.avatar)`，支持本地静态路径或 MinIO key
- 提供「恢复默认」按钮：将 `profile.avatar` 写为 `/author.png`，后端按资源 ID 清空绑定，不对默认静态路径做绑定

## 五、路由与页面规范

### 5.1 路由总览

| 路由 | 类型 | 功能 |
|------|------|------|
| `/` | Client | 首页 |
| `/blog` | Client | 博客列表 |
| `/post/[slug]` | Client | 文章详情 |
| `/categories` | Client | 分类 |
| `/tags` | Client | 标签 |
| `/archive` | Client | 归档 |
| `/about` | Client | 关于 |
| `/links` | Client | 友情链接 |
| `/help` | Client | 帮助与反馈 |
| `/privacy` | Client | 隐私政策 |
| `/terms` | Client | 服务条款 |
| `/settings` | Client | 用户设置 |
| `/rss.xml` | Route Handler | RSS 2.0 订阅源 |
| `/admin/login` | Client | 管理员登录 |
| `/admin` | Client | 管理后台（仪表盘） |
| `/admin/posts` | Client | 文章管理 |
| `/admin/posts/new` | Client | 新建文章 |
| `/admin/posts/[id]` | Client | 编辑文章 |
| `/admin/posts/taxonomy` | Client | 分类与标签管理 |
| `/admin/users` | Client | 用户管理 |
| `/admin/comments` | Client | 评论管理 |
| `/admin/feedbacks` | Client | 反馈管理 |
| `/admin/notifications` | Client | 通知管理 |
| `/admin/links` | Client | 友链管理 |
| `/admin/files` | Client | 文件管理 |
| `/admin/security` | Client | 安全设置 |
| `/admin/settings` | Client | 站点设置 |

### 5.2 Route Group 规则

- `(site)`：前台路由分组，不影响 URL，提供统一 Layout（Navbar + Footer）
- `admin/(dashboard)`：需要 Session 认证的后台路由分组（Layout 负责校验与布局）
- `admin/login`：位于 `(dashboard)` 之外，不受认证保护

### 5.3 Provider 策略

```
providers.tsx:
  HeroUIProvider
    └── NextThemesProvider
          ├── 非 /admin 路由 → UserAuthProvider → NotificationProvider
          └── /admin/* 路由 → 仅渲染 children
```

### 5.4 标题与 Metadata

- 根布局：`app/layout.tsx` 通过 `generateMetadata()` 提供静态默认值（标题模板、description、icons、RSS alternates）
- 前台运行时覆盖（`app/providers.tsx`）：
  - 跳过 `/admin/*`
  - 跳过 `/post/*` 的标题覆盖
  - 默认标题：`site.title || site.name`
  - 默认描述：`site.description`
- 文章页标题（`app/(site)/post/[slug]/page.tsx`）：`site.name || site.title` 作为站点名，组合为 `${siteName}-${post.title}`
- 后台标题（`app/admin/(dashboard)/layout.tsx`）：`site.name` 作为站点名（空则回退 `Nimbus Blog`），组合为 `${siteName}-${phrase}`

### 5.5 Route Handler 规范

非页面路由（如 RSS）使用 Route Handler（`route.ts`），按 URL 路径放在 `app/` 下。

| 路由 | 文件位置 |
|------|----------|
| `/rss.xml` | `app/rss.xml/route.ts` |

规则：
- 仅导出 HTTP 方法函数（`GET` / `POST` 等），不使用 `"use client"`
- 通过 `fetch` 直接请求后端 API，自行解包 `ApiEnvelope<T>` 的 `data`
- 不复用 `lib/api/http.ts`（其包含浏览器态逻辑，例如 localStorage）
- 站点 URL 使用 `new URL(request.url).origin`
- 缓存使用 `export const revalidate = N` 与响应头 `Cache-Control`（RSS 当前为 3600 秒）

### 5.6 缓存与 NEXT_PUBLIC_API_BASE

- Client Component：可使用相对路径（`NEXT_PUBLIC_API_BASE` 为空时）通过反代访问 `/api/*`
- Server/Route Handler：必须使用绝对的 `NEXT_PUBLIC_API_BASE`（Node 端 `fetch` 不支持相对路径）

## 六、组件规范

### 6.0 命名与位置

- components 目录内的组件文件统一使用 PascalCase 命名（如 Navbar.tsx、NotificationBell.tsx、MDXContent.tsx、MDXComponents.tsx）。
- 非组件的工具函数不放在 components 目录，统一归档到 lib/*（如 TOC 解析放在 lib/mdx/toc.ts）。
- 每个功能目录提供 index.ts 进行 Barrel 导出，外部引入统一使用 Barrel 路径。
- 组件内部之间的依赖优先使用相对路径或明确的域路径，不在 Barrel 中导出内部工具。

### 6.1 服务端 vs 客户端组件

- Layout 组件优先保持为 Server Component（如 `app/layout.tsx`、`app/(site)/layout.tsx`），页面与交互组件使用 `"use client"`
- 页面数据获取以 Client Component + `useEffect` 为主，避免构建期依赖后端
- **Navbar / Footer** 为 Client Component，内部通过 `useEffect` 调用 `fetchSettingsMap()` 获取后端配置
- Admin 页面为 Client Component（交互操作 + Session 校验）

### 6.2 域划分

| 目录 | 用途 | 示例组件 |
|------|------|---------|
| `components/site/layout/` | 前台布局 | Navbar, Footer |
| `components/site/auth/` | 用户认证 Modal | UserAuth, AuthMenu |
| `components/site/auth/forms/` | 认证表单 | LoginForm, SignupForm, ForgotForm |
| `components/site/post/` | 文章相关组件 | ArticleCard, Comments, TableOfContents, MobileTableOfContents, MDXContent |
| `components/site/notification/` | 站内通知 | NotificationBell |
| `components/admin/layout/` | 后台布局 | Sidebar, Header |
| `components/admin/editor/` | MDX 编辑器封装 | ForwardRefEditor, InitializedMDXEditor |
| `components/admin/posts/` | 后台文章表单 | PostForm |
| `components/common/icons/` | SVG 图标 | SearchIcon, HeartIcon, EyeFilledIcon, MailIcon, LockIcon, BellIcon, CheckDoubleIcon, QQIcon 等 |
| `components/common/utility/` | 通用工具组件 | ThemeSwitch, ScrollToTopButton |
| `components/common/` | 样式变体 | primitives.ts（title、subtitle） |

### 6.3 Barrel Export

每个功能目录通过 `index.ts` 统一导出：

```ts
// components/site/post/index.ts
export { Comments } from "./Comments";
export { TableOfContents } from "./TableOfContents";
export { MobileTableOfContents } from "./MobileTableOfContents";
export { MDXContent } from "./MDXContent";
export { useMDXComponents } from "./MDXComponents";

// components/admin/layout/index.ts
export { Header } from "./Header";
export { Sidebar } from "./Sidebar";

// components/common/icons/index.ts — 所有图标统一导出
```

**导入时优先使用 Barrel path：**

```ts
import { Comments, TableOfContents, MDXContent, useMDXComponents } from "@/components/site/post";
import { Header, Sidebar } from "@/components/admin/layout";
```

### 6.4 图标组件规范

所有图标放在 `components/common/icons/` 下，统一规范：

- 类型使用 `IconSvgProps`（来自 `@/types`）
- 使用 `export default`
- 不需要解构 `size` 的简单图标直接 `(props: IconSvgProps)` 传透
- 需要 `size` 控制尺寸的图标使用 `({ size = 24, width, height, ...props }: IconSvgProps)` 模式
- Barrel export 统一在 `index.ts` 中 `export { default as XxxIcon } from "./XxxIcon"`

```tsx
// 简单图标（使用 CSS 控制大小）
import type { IconSvgProps } from "@/types";

const MailIcon = (props: IconSvgProps) => (
  <svg height="1em" width="1em" viewBox="0 0 24 24" {...props}>
    <path d="..." fill="currentColor" />
  </svg>
);

export default MailIcon;

// 支持 size prop 的图标
const SearchIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => (
  <svg height={size || height} width={size || width} viewBox="0 0 24 24" {...props}>
    <path d="..." stroke="currentColor" />
  </svg>
);

export default SearchIcon;
```

### 6.5 Admin Sidebar 导航结构

采用"分组标题 + 导航项"模式，各组之间用分割线分隔。Sidebar 支持**折叠/展开**，折叠状态持久化在 `localStorage`（key: `admin-sidebar-collapsed`）。

**头部区域：** 固定 Logo（`/logo.png`）+ 站点名称（从 `site.name` 设置获取，通过 `layout.tsx` props 传入）。折叠时仅显示 Logo。

**折叠行为：**
- 展开：`w-60`，显示 Logo + 站点名称 + 分组标题 + 图标 + 文字标签
- 折叠：`w-16`，仅显示 Logo + 图标（Tooltip 显示标签），分组标题隐藏

```
概览
  └── 仪表盘
内容管理
  ├── 文章列表
  ├── 发布文章
  └── 分类与标签
互动管理
  ├── 评论管理
  ├── 反馈管理
  └── 通知管理
系统
  ├── 用户管理
  ├── 文件管理
  ├── 友链管理
  ├── 站点设置
  └── 安全设置
─────────────
收起菜单 / 退出登录
```

### 6.6 移动端布局规则（Navbar/Footer）
- Navbar（手机端）右侧仅保留「展开按钮」与「主题切换」，登录与通知移入菜单；GitHub 链接不在顶栏展示。
- NavbarMenu 内容包含：搜索、导航项、RSS 按钮、登录入口；避免顶栏拥挤导致展开按钮不可见。
- Footer 底部链接区使用 `flex-wrap` 与小间距（`gap-2 sm:gap-4`），在小屏下居中对齐。
- ICP/公安备案号链接添加 `break-all`，长文本可换行，避免一行超长挤出屏幕。
- 支持区与快速导航维持分组栅格（`grid-cols-1 md:grid-cols-4`），保证手机端纵向堆叠、桌面端多列展示。
## 七、配置与站点设置规范

### 7.1 数据来源划分

前端配置数据分为两类来源，**严禁混用**：

| 来源 | 存放位置 | 内容 | 典型使用方 |
|------|----------|------|-----------|
| **后端 `site_settings`** | 数据库，通过 V1 `/settings` 或 Admin `/settings` API 获取 | 站点名称、标语、描述、个人简介、社交链接等**可在后台配置的动态信息** | Navbar、Footer、首页、关于页等 |
| **前端 `config/site.ts`** | 代码仓库，构建时确定 | 导航路由、RSS 路径、联系邮箱等**纯前端路由/UI 配置** | Navbar（导航项）、Footer（快速导航）、Help 页（邮箱）等 |

### 7.2 后端 `site_settings` 主要键

| 键 | 说明 | 使用位置 |
|----|------|----------|
| `site.name` | 站点名称 | Navbar 品牌、Footer 版权、Sidebar 品牌、UserAuth 欢迎语 |
| `site.slogan` | 站点标语 | Navbar Logo 下方 |
| `site.description` | 站点描述 | Footer |
| `site.title` | 站点标题（含副标题） | RSS |
| `site.hero` | 首页 Hero 介绍文案 | 首页 |
| `site.faq` | 常见问题（JSON） | 帮助页 |
| `site.icp_record` | ICP 备案号 | Footer |
| `site.police_record` | 公安备案号 | Footer |
| `profile.name` | 个人昵称 | 首页、关于页、Footer（作者）、RSS |
| `profile.avatar` | 个人头像 | 首页、关于页、RSS |
| `profile.bio` | 个人简介 | 关于页 |
| `profile.tech_stack` | 技术栈（JSON 数组） | 首页、关于页 |
| `profile.github_url` | GitHub 链接 | Navbar、Footer、首页、关于页、帮助页 |
| `profile.bilibili_url` | Bilibili 链接 | Footer、首页、关于页 |
| `profile.qq_group_url` | QQ 群链接 | 关于页、Footer |
| `profile.email` | 联系邮箱 | Footer（支持区）、关于页 |
| `profile.work_experiences` | 工作经历（JSON 数组） | 关于页 |
| `profile.project_experiences` | 项目经验（JSON 数组） | 关于页 |

获取方式：
- 前台页面与组件（Navbar/Footer/首页/关于等）为 Client Component，在 `useEffect` 中通过 `listSettings()` 或 `fetchSettingsMap()` 获取
- Admin 页面通过 `lib/api/admin/setting.ts` 获取（需要 Session Cookie）
- 根 `layout.tsx` 的 `generateMetadata()` 使用静态默认值，不在构建期请求后端

### 7.3 Logo 统一规范

所有 Logo 统一使用 **固定静态文件** `public/logo.png`，不从后端 `site_settings` 获取。

| 使用位置 | 引用方式 | 尺寸 |
|----------|----------|------|
| Navbar | 使用 `next/image` 引用 `/logo.png`（提供 `width=40`、`height=40`，优先加载） | `w-10 h-10` |
| Admin Sidebar | 使用 `next/image` 引用 `/logo.png`（提供 `width=36`、`height=36`，优先加载） | `w-9 h-9` |
| Admin Login | 使用 `next/image` 引用 `/logo.png`（提供 `width=64`、`height=64`，优先加载） | `w-16 h-16` |
| 浏览器 Favicon | `metadata.icons.icon: "/logo.png"` | — |
| RSS | 硬编码 `${siteUrl}/logo.png` | — |

**规则：**
- **不使用** SVG Logo 组件
- **不从** `site_settings` 动态获取 Logo 路径
- Logo 图片为蓝紫渐变 PNG，兼容亮色/暗色模式
- 更换 Logo 时直接替换 `public/logo.png` 文件即可

### 7.4 前端静态配置（`config/site.ts`）

`siteConfig` **仅包含**纯前端路由和 UI 配置，不包含任何可在后台管理的动态信息：

| 字段 | 用途 | 引用位置 |
|------|------|----------|
| `navItems` | 桌面端导航项 | Navbar、Footer 快速导航 |
| `navMenuItems` | 移动端导航项（含帮助/设置） | Navbar 移动菜单 |
| `links.rss` | RSS 订阅路径 | Navbar、Footer、`layout.tsx`（RSS 自动发现） |

**规则：**
- 导航路由、RSS 路径等前端路由配置从 `siteConfig` 引用
- 站点名称、标语、描述、社交链接、联系邮箱等动态信息**必须**从后端 `site_settings` 获取，**不得**硬编码在前端代码中
- 动态配置在 Client Component 的 `useEffect` 中获取（需要时可先渲染默认值再覆盖）

### 7.5 Settings API 工具函数

`lib/api/v1/setting.ts` 提供两个函数：

| 函数 | 返回值 | 说明 |
|------|--------|------|
| `listSettings()` | `SiteSettingDetail[]` | 原始设置列表 |
| `fetchSettingsMap()` | `Record<string, string>` | 键值映射（`Record<string, string>`） |

## 八、状态管理

- 全局 Provider 放 `app/providers.tsx`（HeroUI、主题、用户认证、通知）
- `UserAuthProvider` 仅包裹前台路由，提供 `user / login / register / refresh / logout` 等方法
- `NotificationProvider` 嵌套在 `UserAuthProvider` 内，提供 `unreadCount / refreshUnreadCount / setUnreadCount`，自动建立 SSE 连接
- Admin 不使用 UserAuthProvider / NotificationProvider，通过 `checkSession()` 直接校验 Session Cookie
- 功能级状态放 `context/` 目录下独立文件
- 避免过度使用全局状态，优先用组件本地 `useState`

## 九、样式规范

- 使用 Tailwind CSS utility classes
- 组件样式通过 HeroUI + Tailwind Variants 组合
- `primitives.ts` 提供可复用的 `title` / `subtitle` TV 变体，用于页面标题统一样式
- 全局样式仅放 `styles/globals.css`
- 第三方组件主题适配放 `styles/` 下独立 CSS 文件（如 `mdx-editor-heroui.css`），通过 CSS 变量映射 HeroUI 主题色
- 避免内联 `style` 属性，统一用 class
- 深色模式通过 `next-themes` + HeroUI 自动处理

### 9.1 省略文本悬停显示（TruncatedText）

- 所有出现省略号的文本（单行 `truncate` / 多行 `line-clamp-*`），统一使用 `components/common/utility/TruncatedText` 包裹以在悬停时显示完整内容。
- 溢出判定：单行比较 `scrollWidth > clientWidth`；多行比较 `scrollHeight > clientHeight`。仅在确实溢出时启用 Tooltip。
- 交互规则：Tooltip 默认 `placement="top"`，未溢出时禁用 Tooltip 并使用原生 `title` 兜底，避免干扰正常阅读。
- 常见位置：表格单元格标题/文件名、卡片标题、摘要说明、通知弹层中的标题与内容。
- 用法示例：

```tsx
import { TruncatedText } from "@/components/common/utility";

// 单行
<TruncatedText className="truncate max-w-xs" text={post.title} />

// 多行
<TruncatedText className="line-clamp-2 text-default-500" text={post.excerpt} multiLine />
```

### 9.2 侧栏模块布局约定

- 后台/前台的侧栏模块优先采用**单个 Card + Divider 分段**的布局，避免多个独立 Card 产生不连续的灰背景与边界不一致问题。
- 模块之间使用 `Divider` 或小型分组标题进行分隔，保持统一的内边距与视觉节奏。
### 9.3 表单校验规范

前端表单的校验规则须与后端 Request DTO 的 `validate` tag 保持一致。

**密码字段统一 8-20 字符：**

| 场景 | `maxLength` | 前端 validate | 后端 validate |
|------|-------------|---------------|---------------|
| 登录（已有密码） | `20` | 仅校验非空 | `min=1,max=20` |
| 注册/重置/修改（新密码） | `20` | `length < 8 \|\| length > 20` | `min=8,max=20` |

**Input/Textarea 必须设置 `maxLength`：**

| 字段类型 | `maxLength` | 示例 |
|----------|-------------|------|
| 用户名 | `32` | 注册表单 |
| 昵称/姓名 | `50-100` | 用户设置、Admin 个人信息 |
| 个人简介 | `500` | 用户设置 |
| 文章标题/Slug | `200` | PostForm |
| 分类/标签名/Slug | `50` | 分类标签管理、PostForm 新建弹窗 |
| 友链名称 | `100` | 友链管理 |
| 反馈/评论/通知内容 | `5000` | 反馈页、评论组件、通知管理 |
| OTP 验证码 | `6` | 登录、2FA 设置 |
| 邮箱验证码 | `6` | 注册、忘记密码 |

**前端验证函数需校验 min/max 并给出明确提示**（如"密码需要8-20个字符"），不依赖仅靠 `maxLength` 截断。

**错误提示显示与清理（必做）：**
- 表单错误状态统一使用 `Record<string, string>`，字段名作为 key，空字符串表示无错误。
- `Input/Textarea` 必须同时绑定 `isInvalid={!!errors.xxx}` 与 `errorMessage={errors.xxx}`。
- 用户输入时要立即清理对应字段错误，避免“改正确但错误提示不消失”：
  - 简单字段：只清理自身错误
  - 依赖字段（如 `password` 与 `confirmPassword`）：任一输入变化时同时清理两者相关错误
  - 图形验证码：刷新验证码时清理 `errors.captcha`，并清空 `captchaInput`

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

<Input
  value={email}
  isInvalid={!!errors.email}
  errorMessage={errors.email}
  onValueChange={(v) => {
    setEmail(v);
    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
  }}
/>;

<Input
  value={password}
  isInvalid={!!errors.password}
  errorMessage={errors.password}
  onValueChange={(v) => {
    setPassword(v);
    if (errors.password || errors.confirmPassword) {
      setErrors((p) => ({ ...p, password: "", confirmPassword: "" }));
    }
  }}
/>;
```

### 9.4 MDX 正文样式（markdown-content）
- 文章正文统一使用 `.markdown-content` 样式，定义于 `styles/markdown.css`，覆盖段落、标题、代码块、表格、引用等通用样式。
- 响应式规则：在小屏下缩小标题字号、控制代码块与表格的滚动与换行；在大屏恢复正常字号与布局。
- 深色模式：通过 HeroUI 主题变量（`--heroui-*`）自动适配代码块、边框与文本颜色。
- `MDXContent` 组件会在渲染容器上添加 `.markdown-content`；`app/layout.tsx` 已全局引入 `styles/markdown.css`。

## 十、MDX 内容渲染规范

### 10.1 渲染方案

文章内容以 Markdown/MDX 格式存储在后端。前台文章详情页使用 `next-mdx-remote` 进行客户端渲染：

1. 页面加载后通过 API 获取文章的 `content` 字段（Markdown 字符串）
2. 调用 `serializeMdxContent(content)` 序列化为 `MDXRemoteSerializeResult`（内部会执行 `normalizeMdxContent`，并启用 `remark-gfm` + `rehype-pretty-code`）
3. 通过 `<MDXRemote />` + `useMDXComponents()` 渲染正文
4. 序列化失败时降级为 `<pre>` 显示原始内容

### 10.2 组件结构

| 文件 | 职责 |
|------|------|
| `components/site/post/MDXComponents.tsx` | MDX 组件映射（标题/段落/代码/图片等），使用 HeroUI 组件 |
| `components/site/post/MDXContent.tsx` | MDX 渲染容器，负责 `serialize` + `<MDXRemote />`，为标题生成锚点 ID |
| `components/site/post/TableOfContents.tsx` | 桌面端侧边栏目录，解析 Markdown 标题 + 滚动高亮 |
| `components/site/post/MobileTableOfContents.tsx` | 移动端可折叠目录 |
| `lib/mdx/content.ts` | 正文规范化与统一序列化（`normalizeMdxContent`、`serializeMdxContent`） |
| `lib/mdx/toc.ts` | TOC 标题解析共享逻辑（`parseTocItems`、`generateHeadingId`） |

### 10.3 标题锚点生成

`MDXContent` 中所有标题（h1-h6）自动生成锚点 ID：

```
"Hello World 123" → "hello-world-123"
```

规则：小写 → 移除非字母数字字符 → 空格转 `-` → 去重复 `-`。TOC 组件用同样的算法匹配（定义在 `lib/mdx/toc.ts` 中共享）。

### 10.4 文章详情页结构

```
post/[slug]/page.tsx
├── 返回按钮 → /blog
├── 标题 + 摘要 + 分类 Chip
├── 作者信息卡片（头像/名称从 site_settings 读取，日期/阅读时间/浏览量/点赞）
├── 标签 Chips
├── 移动端目录（MobileTableOfContents）
├── 左：MDX 内容卡片（MDXContent）| 右：桌面端目录（TableOfContents sticky）
├── 居中点赞按钮
├── 评论区（Comments 组件：线程式评论/回复/点赞/删除/待审核提示）
└── 底部操作（回到顶部 + 浏览更多文章）
```

#### 10.4.1 目录（TOC）粘性定位与避让

- 桌面端右侧目录容器使用粘性定位并避让导航栏：`hidden lg:block lg:w-64 xl:w-72 lg:flex-shrink-0 lg:sticky lg:top-20 lg:self-start lg:h-fit`（见 `app/(site)/post/[slug]/page.tsx`）。
- 目录卡片内部滚动区域：`max-h-[56vh] xl:max-h-[calc(100vh-16rem)]`，保证目录可滚动且不会过高压缩正文可视区域。
- 避免在目录容器的任何祖先元素上设置 `overflow: hidden/auto/scroll`，否则会破坏 sticky 生效。

#### 10.4.2 目录与正文联动规则

- 标题锚点由 `MDXContent` 统一生成；重复标题以 `-n` 后缀保证唯一，TOC 使用同一算法（共享于 `lib/mdx/toc.ts`）。
- 高亮算法：使用滚动监听实时计算标题实际文档坐标，取 `window.scrollY + TOP_OFFSET` 为基准，选取不大于该值的最后一个标题作为当前高亮；`TOP_OFFSET=80` 与 `lg:top-20` 对齐。
- 点击目录项滚动定位时，按 `TOP_OFFSET` 修正目标位置，避免标题被导航栏遮挡。
- DOM 回退：当 `parseTocItems(content)` 为空或与正文标题 ID 不一致时，直接从 `.markdown-content` 读取 `h1–h6` 的 `id/text/level` 生成目录项，保证联动可靠。
- 受影响文件：
  - `components/site/post/TableOfContents.tsx` — 桌面端目录与联动逻辑
  - `components/site/post/MobileTableOfContents.tsx` — 移动端折叠目录（应复用同一联动策略）
  - `components/site/post/MDXContent.tsx` — 标题 ID 生成与渲染容器（`.markdown-content`）
  - `lib/mdx/toc.ts` — TOC 标题解析与 ID 生成共享逻辑

**点赞状态（`LikeInfo` 模式）：**
- V1 响应通过 `like: LikeInfoDTO`（`liked: boolean | null` + `likes: number`）统一承载点赞状态和计数；`liked` 为 `null` 表示未登录
- Admin 响应使用独立 `likes` 字段；前端通过 `V1PostSummary` 与 `AdminPostSummary` 分别建模两套响应，避免可选字段混用

**评论列表数据流：**
- 后端返回该文章所有已审核评论的**扁平数组**（非分页），前端 `buildThread` 构建线程树
- 前端按根评论进行**客户端分页**（每页 10 条根评论），子回复随父评论一起展示

**评论审核提示：**
- 用户提交评论后，显示"待管理员审核通过后将公开显示"的提示横幅
- 评论审核通过后，用户会收到 `comment_approved` 站内通知

**Admin 评论管理：**
- Tabs 筛选：待审核 / 全部 / 已通过 / 已拒绝
- 操作按钮：未通过的评论显示"通过"，待审核的评论同时显示"拒绝"，所有评论可删除
- 后端 `UpdateCommentStatus` 支持 `approved`/`rejected`/`spam` 三种目标状态

**账号禁用处理：**
- 后端在 `NewUserJWTMiddleware` 内完成“验签 + refresh 会话有效性校验（Redis refresh_token:{userID}）”；会话无效访问需要鉴权的接口返回 `401`
- 登录和刷新 token 时校验 `user.Status`，禁用用户返回 `403 account disabled`
- 前端应在 refresh 返回 `403` 时提示“账号已被禁用”，并清空 access token 与本地登录态
- refresh 接口响应体仅返回 `access_token/token_type/expires_in`（与 login 一致）；refresh token 只通过 HttpOnly Cookie 写入

### 10.5 代码语法高亮（rehype-pretty-code / Shiki）

- 方案：在序列化阶段通过 rehype-pretty-code + Shiki 生成语法高亮 HTML，避免客户端运行时高亮
- 配置位置：`lib/mdx/content.ts`（`serializeMdxContent` 统一封装），页面与 `MDXContent` 复用同一配置
- 主题：`github-light` / `github-dark-dimmed`；`keepBackground: true` 保留 Shiki 主题背景，提高代码块可读性与对比度（全局样式不覆盖代码块背景）
- 默认语言：未声明语言时默认 `plaintext`（`block` 与 `inline`）
- 样式：`styles/markdown.css` 使用 `code[data-theme]`、`[data-line]`、`[data-highlighted-line]`、`[data-highlighted-chars]` 等属性；行号可用 CSS counter

### 10.6 常用 MDX/GFM 语法兼容约定

- frontmatter：允许文章内容以 YAML frontmatter 开头（`--- ... ---`），前台渲染前必须剥离，避免出现在正文中
- GFM：统一启用 `remark-gfm`，支持表格、任务列表、删除线、自动链接、脚注等常见语法
- 任务列表与脚注：通过 `styles/markdown.css` 提供基础展示样式（含 checkbox、脚注分割线）
- 行内代码：优先使用可读性高的文字高亮；当 `rehype-pretty-code` 为行内 code 注入 `data-theme` 时，行内样式应优先覆盖 Shiki 默认文本色，避免与正文同色

**MDX 用法示例：**

```md
```js {1-3,5}
// 高亮第 1–3 行与第 5 行
```

```js showLineNumbers
// 显示行号
```

```js title="main.ts" caption="示例代码"
console.log("hello");
```

```md
/carrot/ /apple/   // 字符高亮
```
```

## 十一、MDX 编辑器规范（Admin）

### 11.1 编辑器组件结构

| 文件 | 职责 |
|------|------|
| `components/admin/editor/ForwardRefEditor.tsx` | 动态导入包装器（`next/dynamic` + `ssr: false`），对外暴露 `MDXEditorMethods` ref |
| `components/admin/editor/InitializedMDXEditor.tsx` | 编辑器核心配置，注册所有插件 |

### 11.2 图片上传

编辑器通过 `imagePlugin` 的 `imageUploadHandler` 实现图片插入（粘贴、拖拽、工具栏按钮）：

1. 调用 `generateUploadURL({ upload_type: "post_content", ... })` 获取 presigned URL
2. 调用 `uploadFileToPresignedURL(upload_url, file)` 直传 MinIO
3. 返回 `getFileURL(object_key)` 作为图片的 Markdown URL

图片通过 `/api/v1/files/{object_key}` 访问，后端在文章创建/更新时自动提取 markdown 中的 object key 并绑定 `resource_id`。

## 十二、TypeScript 规范

### 12.1 严格类型

- 开启 `strict: true`
- **禁止使用 `any`**：
  - 表单错误状态使用 `Record<string, string>` 代替 `any`
  - catch 子句使用 `catch (e: unknown)` + `e instanceof Error` 判断
  - 泛型回调参数使用 `unknown[]` 或具体类型代替 `any[]`
  - SVG 图标 props 使用 `IconSvgProps`（来自 `@/types`）

### 12.2 错误处理模式

```tsx
// 正确 ✓
try {
  await apiCall();
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : "操作失败";
  setError(message);
}

// 错误 ✗ — 禁止使用 any
try {
  await apiCall();
} catch (e: any) {
  setError(e?.message || "操作失败");
}
```

Admin 表单/弹窗错误反馈：
- 调用后端创建/更新/删除失败时，**必须给用户可见的错误提示**，禁止只写 `catch { /* Ignore */ }`
- 默认在主操作按钮附近展示错误文本：`<p className="text-danger text-sm">{error}</p>`

### 12.3 类型定义位置

| 类型 | 位置 |
|------|------|
| 全局工具类型（`IconSvgProps`） | `types/index.ts` |
| API 共享 DTO | `lib/api/types.ts` |
| 请求体 / 查询参数类型 | 各 API 模块文件内 |
| 组件 Props | 组件文件内（`interface Props { ... }`） |

## 十三、资源文件规范

| 文件 | 用途 | 说明 |
|------|------|------|
| `public/logo.png` | 统一 Logo | 512x512 蓝紫渐变 PNG，用于 Navbar / Sidebar / Login / Favicon / RSS |
| `public/author.png` | 默认作者头像 | 关于页等兜底头像 |

## 十四、环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_BASE` | 后端 API 基础地址（构建/SSR 必须绝对地址） |

客户端可访问的变量必须以 `NEXT_PUBLIC_` 前缀。

**使用规则：**
- 本地开发：在 `.env.local` 写 `NEXT_PUBLIC_API_BASE=http://localhost:8080`
- 部署环境：在构建（`pnpm build`）之前设置 `NEXT_PUBLIC_API_BASE=https://your-domain`，由反向代理将 `/api/*` 转发到后端
- 构建/SSR：必须是绝对地址；相对路径会导致 Node 端 `fetch` 失败并出现页面数据收集超时重试

## 十五、资源链接

### 15.1 核心框架

| 技术 | 文档 |
|------|------|
| Next.js 16.1.6（App Router） | https://nextjs.org/docs |
| React 19.2.4 | https://react.dev |
| TypeScript 5.6.3 | https://www.typescriptlang.org/docs |

### 15.2 UI / 样式

| 技术 | 文档 |
|------|------|
| HeroUI v2（组件库） | https://www.heroui.com/docs |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| Tailwind Variants（TV） | https://www.tailwind-variants.org |
| Framer Motion 11（动画） | https://www.framer.com/motion |
| next-themes（深色模式） | https://github.com/pacocoursey/next-themes |

### 15.3 内容 / 编辑器

| 技术 | 文档 |
|------|------|
| MDXEditor（Admin 富文本编辑器） | https://mdxeditor.dev |
| next-mdx-remote 6（客户端 MDX 渲染） | https://github.com/hashicorp/next-mdx-remote |
| rehype-pretty-code（Shiki 高亮） | https://rehype-pretty.pages.dev/ |
| Shiki（语法高亮引擎） | https://shiki.matsu.io |
| feed 5（RSS / Atom / JSON Feed 生成） | https://github.com/jpmonette/feed |

### 15.4 工具库

| 技术 | 文档 |
|------|------|
| clsx（条件 className 合并） | https://github.com/lukeed/clsx |
| @react-aria/ssr（SSR 兼容） | https://react-spectrum.adobe.com/react-aria |
| @react-aria/visually-hidden（无障碍隐藏） | https://react-spectrum.adobe.com/react-aria/VisuallyHidden.html |

### 15.5 开发工具

| 技术 | 文档 |
|------|------|
| pnpm（包管理） | https://pnpm.io |
| ESLint 9（Flat Config） | https://eslint.org/docs/latest |
| Prettier | https://prettier.io/docs |
| @typescript-eslint | https://typescript-eslint.io |
| eslint-plugin-import（import 排序） | https://github.com/import-js/eslint-plugin-import |
| eslint-plugin-jsx-a11y（无障碍检查） | https://github.com/jsx-eslint/eslint-plugin-jsx-a11y |
| eslint-plugin-unused-imports（清理未使用导入） | https://github.com/sweepline/eslint-plugin-unused-imports |
| PostCSS | https://postcss.org |

## 十六、代码清洁与规范（Lint/可访问性/配置）

- 未使用导入与变量
  - 启用 eslint-plugin-unused-imports，配合 `eslint --fix` 自动移除未使用的导入
  - 未使用的 `catch` 变量统一用可选捕获写法：`catch { /* ... */ }`
  - `@typescript-eslint/no-unused-vars` 仅警告，尽量重构移除无用状态与函数
- 可访问性
  - 非原生交互元素（如 `div`）若绑定点击事件，必须添加 `role="button"`、`tabIndex={0}`，并处理键盘触发（Enter/Space）
  - 仅做分组/标题用途的文案，不使用 `<label>`；如需 `<label>`，必须具备 `htmlFor` 并关联到可聚焦控件
  - Headings（h1–h6）在空内容时不渲染，避免 A11y 报错
- 图片
  - 优先使用 `@heroui/image` 或 `next/image`，避免原生 `<img>` 造成 LCP 变差（参考 Next.js no-img-element 规则）
  - 同源图片无需配置；如需跨域图片，需在 `next.config.js` 的 `images.domains` 或 `images.remotePatterns` 中声明允许来源（项目已预留空配置）
  - 后台「文件管理」表格缩略图为预览场景，可使用原生 `<img>` 并就地禁用 `@next/next/no-img-element`
  - 配置示例：

    ```js
    // next.config.js
    export default {
      images: {
        domains: ["images.example.com"],
        remotePatterns: [
          { protocol: "https", hostname: "cdn.example.com", pathname: "/**" },
          { protocol: "https", hostname: "img.example.org", pathname: "/assets/**" },
        ],
      },
    };
    ```
- 配置与 ESM
  - 项目采用 ESM：`package.json` 设置 `"type": "module"`
  - `next.config.js` 使用 `export default nextConfig`（或改名为 `next.config.mjs`）
  - 已设置 `turbopack.root` 指向项目根目录，避免多锁文件导致的工作区根推断警告
  - `postcss.config.js` 使用 `export default { plugins: { "@tailwindcss/postcss": {} } }`
- ESLint
  - Flat Config 模式启用 `@next/eslint-plugin-next` 插件，确保 Next 规则可用（不使用 `extends: eslint-config-next`）
  - 插件清单：`react`、`@next/next`、`@typescript-eslint`、`import`、`jsx-a11y`、`unused-imports`、`prettier`
  - 避免在同一 Flat 配置对象重复定义同名插件（会报「Cannot redefine plugin」）
- 参考文档
  - Next.js 调试与样式：Guides Debugging、App Router CSS Styling
  - HeroUI + Tailwind v4：Tailwind v4 指南、各框架集成页
  - Tailwind CSS Play CDN 与 v3/v4 迁移说明

---

## 十七、与后端接口对应关系

| 前端模块 | 后端路由前缀 | 认证方式 |
|----------|-------------|---------|
| `admin/auth` | `/api/admin/auth` | Session Cookie |
| `admin/file` | `/api/admin/files` | Session Cookie |
| `admin/user` | `/api/admin/users` | Session Cookie |
| `admin/content` | `/api/admin/content` | Session Cookie |
| `admin/comment` | `/api/admin/comments` | Session Cookie |
| `admin/feedback` | `/api/admin/feedbacks` | Session Cookie |
| `admin/link` | `/api/admin/links` | Session Cookie |
| `admin/notification` | `/api/admin/notifications` | Session Cookie |
| `admin/setting` | `/api/admin/settings` | Session Cookie |
| `v1/file` | `/api/v1/files` | 无 |
| `v1/captcha` | `/api/v1/captcha` | 无 |
| `v1/email` | `/api/v1/email` | 无 |
| `v1/auth` | `/api/v1/auth` | JWT Bearer（部分） |
| `v1/user` | `/api/v1/user` | JWT Bearer |
| `v1/content` | `/api/v1/content` | 可选 JWT（`withAuth: true`，传递 JWT 以获取 `like` 点赞状态） |
| `v1/comment` | `/api/v1/content` + `/api/v1/comments` | 可选 JWT（`like` 状态） / JWT（写操作） |
| `v1/feedback` | `/api/v1/feedbacks` | 无 |
| `v1/link` | `/api/v1/links` | 无 |
| `v1/notification` | `/api/v1/notifications` + SSE stream | JWT Bearer / Query Token |
| `v1/setting` | `/api/v1/settings` | 无 |
