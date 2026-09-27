# AI Infinite Canvas — 项目开发总规则

## 项目目标
本项目已经存在可工作的无限画布（Canvas）。当前目标是在保留现有 Canvas 的前提下，将项目升级为完整可上线的网站，包含官网、认证、Dashboard、Project CRUD、Canvas 项目化与自动保存、Supabase 数据库/Storage、Next.js 后端 API 和 Vercel 上线。

## 最高优先级原则
1. 不重做现有 Canvas。
2. 不更换现有 Canvas 框架。
3. 不破坏现有 Canvas UI、节点、交互和数据格式。
4. 不为了“优化”重构与当前任务无关的代码。
5. 优先复用已有代码和组件。
6. 数据库适配现有 Canvas，而不是反过来。
7. 所有用户数据必须做权限隔离。
8. Secret Key 不得进入客户端。
9. Canvas 自动保存必须 debounce。
10. 每次只完成一个阶段，验证通过后再进入下一阶段。

## 文档
开始任务前阅读对应 `docs/` 文件。文档中的示例代码用于说明架构，不要求逐字复制；若与当前依赖版本或现有实现冲突，以当前仓库真实版本和最新官方 API 为准，同时保持文档定义的功能、安全要求和验收标准不变。

## 默认工作方式
1. 先阅读相关代码和文档。
2. 确认最小修改范围。
3. 实现当前阶段。
4. 运行仓库真实存在的 build / typecheck / lint / tests。
5. 修复本次改动引入的问题。
6. 检查 `git diff`。
7. 汇报修改文件、完成功能、验证结果、需用户手动配置的内容。
8. 停止，不自动进入下一阶段。

## MVP 顺序
1. 现有仓库分析
2. 网站基础架构
3. Supabase 数据层
4. Auth
5. Dashboard
6. Project CRUD
7. Canvas 项目化
8. Canvas 自动保存
9. Storage
10. 官网首页
11. Production 检查
12. Vercel 上线

## 最终验收
官网 → 注册 → 登录 → Dashboard → 创建项目 → Canvas → 创作 → 自动保存 → 刷新恢复 → 退出 → 再次登录 → 打开旧项目 → 继续创作。
用户 A 不得读取、修改或删除用户 B 的项目、Canvas 或 Assets。
