# AI 无限画布网站 — 前后端目录 / API / Next.js 开发文档

## 1. 项目目录

推荐：

```text
src/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── canvas/
│   │   └── [projectId]/
│   │       └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── api/
│       ├── projects/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── canvas/
│       │           └── route.ts
│       ├── assets/
│       │   └── route.ts
│       └── ai/
│           ├── chat/
│           ├── image/
│           └── video/
│
├── components/
│   ├── home/
│   ├── auth/
│   ├── dashboard/
│   ├── canvas/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth/
│   ├── api/
│   └── utils/
│
├── hooks/
├── types/
└── styles/
```

## 2. API 总览

```text
GET    /api/projects
POST   /api/projects

GET    /api/projects/[id]
PATCH  /api/projects/[id]
DELETE /api/projects/[id]

GET    /api/projects/[id]/canvas
PUT    /api/projects/[id]/canvas

POST   /api/assets
DELETE /api/assets?id=...

POST   /api/ai/chat
POST   /api/ai/image
POST   /api/ai/video
```

## 3. API 返回格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

失败：

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

## 4. 项目列表

```text
GET /api/projects
```

返回：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Untitled",
      "thumbnail_url": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

## 5. 创建项目

```text
POST /api/projects
```

Body：

```json
{
  "name": "Untitled"
}
```

流程：

```text
读取当前用户
↓
创建 project
↓
创建 canvas
↓
返回 projectId
```

## 6. 获取单项目

```text
GET /api/projects/[id]
```

必须检查：

```text
project.user_id === currentUser.id
```

## 7. 重命名项目

```text
PATCH /api/projects/[id]
```

Body：

```json
{
  "name": "New Name"
}
```

限制：

```text
1 - 100 字符
```

## 8. 删除项目

```text
DELETE /api/projects/[id]
```

流程：

```text
验证 owner
↓
查询 assets
↓
删除 Storage 文件
↓
删除 project
↓
级联删除 canvas / assets / ai_generations
```

## 9. 加载 Canvas

```text
GET /api/projects/[id]/canvas
```

返回：

```json
{
  "success": true,
  "data": {
    "canvas_data": {},
    "version": 1,
    "updated_at": "..."
  }
}
```

## 10. 保存 Canvas

```text
PUT /api/projects/[id]/canvas
```

Body：

```json
{
  "canvasData": {}
}
```

必须：

- 验证登录
- 验证项目 owner
- 限制请求体大小
- 处理 JSON 错误
- 更新 updated_at
- 返回保存时间

## 11. 上传素材

```text
POST /api/assets
```

推荐用 multipart/form-data。

字段：

```text
projectId
file
```

后端：

```text
验证登录
↓
验证项目 owner
↓
验证 MIME
↓
验证大小
↓
生成安全路径
↓
上传 Storage
↓
插入 assets
↓
返回 asset
```

## 12. HTTP 状态码

```text
200 成功
201 创建成功
400 参数错误
401 未登录
403 无权限
404 不存在
409 冲突
413 文件过大
429 请求过多
500 服务端错误
```

## 13. 服务端认证模板

```typescript
const {
  data: { user },
  error
} = await supabase.auth.getUser()

if (error || !user) {
  return Response.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized'
      }
    },
    { status: 401 }
  )
}
```

## 14. API 安全要求

1. 不信任前端 user_id。
2. 不信任前端 project owner。
3. 所有项目操作服务端二次校验。
4. Secret Key 只在服务端。
5. 所有输入做长度限制。
6. 上传文件检查 MIME 和大小。
7. 错误信息不要泄漏数据库结构。
8. Production 不返回 stack trace。
