# AI 无限画布网站 — Vercel / GitHub / Supabase 上线部署文档

## 1. 生产架构

```text
GitHub
↓
Vercel
├── Next.js
└── API
     ↓
Supabase
├── PostgreSQL
├── Auth
└── Storage
```

## 2. GitHub

建议仓库：

```text
infinite-canvas-2
```

开发分支可选：

```text
main
dev
```

小项目第一阶段可只用：

```text
main
```

## 3. 环境变量

本地：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
```

Vercel Production 同样配置。

## 4. 禁止提交

```text
.env
.env.local
.env.production
```

必须加入 `.gitignore`。

## 5. Vercel 部署

流程：

```text
GitHub 仓库
↓
Import Project
↓
识别 Next.js
↓
填写 Environment Variables
↓
Deploy
```

## 6. Supabase Auth URL

生产环境需要配置：

```text
Site URL
Redirect URLs
```

例如：

```text
https://yourdomain.com
https://yourdomain.com/**
```

本地：

```text
http://localhost:3000
```

## 7. 自定义域名

Vercel：

```text
Project
↓
Settings
↓
Domains
↓
Add Domain
```

推荐：

```text
yourdomain.com
www.yourdomain.com
```

## 8. HTTPS

Vercel 自动提供 HTTPS。

## 9. Production 检查

上线前：

```text
注册
登录
退出
新建项目
重命名
删除
Canvas 保存
Canvas 恢复
文件上传
RLS
404
错误状态
移动端基础浏览
```

## 10. 自动部署

```text
git push
↓
GitHub
↓
Vercel Build
↓
Production
```

## 11. 回滚

如果新版本异常：

```text
Vercel Deployments
↓
找到上一个正常版本
↓
Promote / Rollback
```

## 12. 生产安全

检查：

```text
Service Role Key 不在前端
AI Key 不在前端
RLS 开启
Storage 权限正确
Production 无 debug secrets
.env 未提交
```
