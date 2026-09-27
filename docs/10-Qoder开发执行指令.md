# AI 无限画布网站 — Qoder 开发执行指令

## 第一次：只分析，不改代码
```text
先不要修改任何文件。
请读取并遵守：AGENTS.md、.qoder/rules/、docs/。
然后完整分析当前代码仓库。
重点确认：技术栈、是否 Next.js、路由、Canvas 入口、Canvas 框架、状态管理、节点/连线/viewport 数据结构、序列化/持久化方式、必须保留的代码、当前仓库与 docs 的差异，以及 MVP 分阶段计划。
现有 Canvas 已经完成，禁止重做。
只分析，不修改文件。
```

## 阶段 1：网站基础架构
阅读 `docs/01` 和 `docs/03`。
```text
建立首页、/login、/signup、/dashboard、/canvas/[projectId] 基础路由，保持现有 Canvas 可运行。本阶段不要接 Supabase、不要做登录逻辑、不要做 AI、不要重写 Canvas。完成后运行真实存在的检查命令、修复本阶段问题、检查 git diff、汇报后停止。
```

## 阶段 2：Supabase 数据层
阅读 `docs/02` 和 `docs/03`。
```text
完成 Supabase browser/server client、migration、profiles、projects、canvases、assets、ai_generations、RLS 和必要 TypeScript 类型。不要修改 Canvas 核心代码，不实现 AI，不暴露 Service Role Key。完成后告诉我需要手动做哪些 Supabase 配置和环境变量，然后停止。
```

## 阶段 3：Auth
阅读 `docs/04`。
```text
实现 signup、login、logout、session、protected routes、forgot password 基础流程和 dashboard 基础页。未登录不能访问 /dashboard 和 /canvas/*。不要开始 Canvas 数据保存。检查通过后停止。
```

## 阶段 4：Dashboard + Project CRUD
```text
实现项目列表、新建、打开、重命名、删除、删除二次确认、空状态、loading、error、owner 权限验证。用户 A 不能操作用户 B 项目。新建成功后进入 /canvas/[projectId]。检查通过后停止。
```

## 阶段 5：Canvas 项目化
阅读 `docs/05`。
```text
先理解现有 Canvas 的真实数据结构、状态、序列化和保存方式。然后以最小修改实现 /canvas/[projectId]、加载 canvas_data、保存 canvas_data、约 1500ms debounce 自动保存、保存状态、刷新恢复、可选 Ctrl/Cmd+S。禁止重写 Canvas、替换框架、改变现有 UI 或无必要改变节点格式。验收：创建项目 → 编辑 → 自动保存 → 刷新 → 恢复。检查通过后停止。
```

## 阶段 6：Storage
阅读 `docs/06`。
```text
实现图片/视频/文件上传、MIME/大小/owner 校验、assets 记录、Private Bucket/Signed URL、删除素材、Canvas 使用上传资源。禁止 Base64 长期保存大文件和客户端 Service Role Key。验收上传、刷新、重新登录后的恢复。检查通过后停止。
```

## 阶段 7：首页 / SEO
阅读 `docs/07`。
```text
实现 Header、Hero、真实 Canvas 产品展示、功能模块、CTA、Footer、登录态按钮、基础响应式、SEO metadata、favicon、Open Graph。不要修改 Canvas 核心 UI，不做无关复杂动画。检查通过后停止。
```

## 阶段 8：Production
阅读 `docs/08` 和 `docs/09`。
```text
执行 production build、typecheck、lint、已有 tests，并检查 Auth、Project CRUD、Canvas 保存恢复、RLS、Storage、Secret、Production env、404/error。修复可安全修复的问题。最后输出是否达到 MVP 上线条件、仍需手动配置、Supabase Production 步骤和 Vercel 部署步骤，然后停止。
```

## 每阶段后的审查
```text
先不要进入下一阶段。检查本阶段 git diff：是否破坏 Canvas、是否有安全问题、owner/RLS 是否遗漏、是否有 Secret 泄露、TypeScript/build/lint 是否通过、是否引入明显死代码或重复代码。发现本阶段引入的问题直接修复，稳定后停止。
```

## 使用原则
不要一次让 Qoder “把整个网站全部做完”。一次只给一个可验收阶段。优先：Plan/分析 → 单阶段开发 → 测试 → git diff 审查 → Git Commit → 下一阶段。
