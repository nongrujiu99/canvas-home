# AI 无限画布网站 — 数据库设计 / Supabase SQL / RLS 开发文档

## 1. 数据库目标

数据库使用：

```text
Supabase PostgreSQL
```

负责：

```text
用户
用户资料
项目
画布数据
上传素材
AI 生成记录
```

第一阶段核心数据关系：

```text
auth.users
    │
    ├── profiles
    │
    └── projects
          │
          ├── canvases
          ├── assets
          └── ai_generations
```

---

## 2. 数据库表

第一阶段创建：

```text
profiles
projects
canvases
assets
ai_generations
```

Supabase 自带：

```text
auth.users
```

不要自己创建 users 表。

---

## 3. profiles 表

用途：保存用户公开资料。

字段：

```text
id
username
avatar_url
created_at
updated_at
```

SQL：

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 4. projects 表

用途：保存用户项目。

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null default 'Untitled',
  thumbnail_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

索引：

```sql
create index projects_user_id_idx
on public.projects(user_id);

create index projects_updated_at_idx
on public.projects(updated_at desc);
```

---

## 5. canvases 表

用途：保存无限画布数据。

一个项目第一阶段对应一个 Canvas。

```sql
create table public.canvases (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null unique
    references public.projects(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  canvas_data jsonb not null default '{}'::jsonb,
  version integer not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

索引：

```sql
create index canvases_user_id_idx
on public.canvases(user_id);

create index canvases_project_id_idx
on public.canvases(project_id);
```

---

## 6. assets 表

用途：保存用户上传资源信息。

实际文件放 Supabase Storage，数据库只保存文件信息。

```sql
create table public.assets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  name text,
  file_type text not null,
  mime_type text,
  file_url text,
  storage_path text not null,
  file_size bigint,
  width integer,
  height integer,
  duration numeric,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);
```

索引：

```sql
create index assets_user_id_idx
on public.assets(user_id);

create index assets_project_id_idx
on public.assets(project_id);
```

---

## 7. ai_generations 表

用途：保存 AI 生成历史。

```sql
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  project_id uuid
    references public.projects(id)
    on delete cascade,

  generation_type text not null,
  provider text,
  model text,
  prompt text,
  negative_prompt text,
  status text not null default 'pending',
  result_url text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

索引：

```sql
create index ai_generations_user_id_idx
on public.ai_generations(user_id);

create index ai_generations_project_id_idx
on public.ai_generations(project_id);
```

---

## 8. updated_at 自动更新函数

```sql
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

---

## 9. updated_at Triggers

```sql
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

create trigger update_projects_updated_at
before update on public.projects
for each row
execute procedure public.update_updated_at_column();

create trigger update_canvases_updated_at
before update on public.canvases
for each row
execute procedure public.update_updated_at_column();

create trigger update_ai_generations_updated_at
before update on public.ai_generations
for each row
execute procedure public.update_updated_at_column();
```

---

## 10. 用户注册后自动创建 Profile

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    username
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  );

  return new;
end;
$$;
```

Trigger：

```sql
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
```

---

## 11. 开启 RLS

```sql
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.canvases enable row level security;
alter table public.assets enable row level security;
alter table public.ai_generations enable row level security;
```

---

## 12. profiles RLS

```sql
create policy "Users can view own profile"
on public.profiles
for select
using (
  auth.uid() = id
);

create policy "Users can update own profile"
on public.profiles
for update
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);
```

---

## 13. projects RLS

```sql
create policy "Users can view own projects"
on public.projects
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own projects"
on public.projects
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own projects"
on public.projects
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own projects"
on public.projects
for delete
using (
  auth.uid() = user_id
);
```

---

## 14. canvases RLS

```sql
create policy "Users can view own canvases"
on public.canvases
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own canvases"
on public.canvases
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own canvases"
on public.canvases
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own canvases"
on public.canvases
for delete
using (
  auth.uid() = user_id
);
```

---

## 15. assets RLS

```sql
create policy "Users can view own assets"
on public.assets
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own assets"
on public.assets
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own assets"
on public.assets
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own assets"
on public.assets
for delete
using (
  auth.uid() = user_id
);
```

---

## 16. ai_generations RLS

```sql
create policy "Users can view own AI generations"
on public.ai_generations
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own AI generations"
on public.ai_generations
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own AI generations"
on public.ai_generations
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own AI generations"
on public.ai_generations
for delete
using (
  auth.uid() = user_id
);
```

---

## 17. 创建项目事务流程

用户点击“新建画布”：

```text
当前用户
↓
INSERT projects
↓
获取 project.id
↓
INSERT canvases
↓
跳转 /canvas/[projectId]
```

推荐使用数据库函数一次完成：

```sql
create or replace function public.create_project(
  project_name text default 'Untitled'
)
returns uuid
language plpgsql
security invoker
as $$
declare
  new_project_id uuid;
begin

  insert into public.projects (
    user_id,
    name
  )
  values (
    auth.uid(),
    coalesce(
      nullif(trim(project_name), ''),
      'Untitled'
    )
  )
  returning id
  into new_project_id;

  insert into public.canvases (
    project_id,
    user_id,
    canvas_data
  )
  values (
    new_project_id,
    auth.uid(),
    '{}'::jsonb
  );

  return new_project_id;
end;
$$;
```

调用：

```typescript
const {
  data: projectId,
  error
} = await supabase.rpc(
  'create_project',
  {
    project_name: 'Untitled'
  }
)
```

---

## 18. 删除项目

由于外键使用：

```sql
on delete cascade
```

删除 project 会自动删除：

```text
canvas
assets 数据
ai_generations 数据
```

注意：

Supabase Storage 文件不会自动删除。

删除项目时后端必须：

```text
读取项目 Assets
↓
删除 Storage 文件
↓
删除 Project
```

---

## 19. Canvas 数据格式

如果现有 Canvas 已有自己的数据格式，继续沿用，不强制转换。

推荐示例：

```json
{
  "version": 1,
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 1
  },
  "nodes": [],
  "edges": [],
  "settings": {}
}
```

---

## 20. Canvas 保存逻辑

```typescript
async function saveCanvas(
  projectId: string,
  canvasData: unknown
) {
  const response = await fetch(
    `/api/projects/${projectId}/canvas`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        canvasData
      })
    }
  )

  if (!response.ok) {
    throw new Error('Save failed')
  }
}
```

---

## 21. Debounce 自动保存

不要每次节点移动都保存。

推荐：

```text
Canvas Change
↓
等待 1500ms
↓
如果没有新变化
↓
保存
```

```typescript
const SAVE_DELAY = 1500
```

---

## 22. 保存状态

```typescript
type SaveStatus =
  | 'saved'
  | 'saving'
  | 'unsaved'
  | 'error'
```

UI：

```text
unsaved  → 未保存
saving   → 正在保存...
saved    → 已保存
error    → 保存失败
```

---

## 23. Canvas API 权限

后端禁止相信前端传入的 user_id。

必须：

```typescript
const {
  data: { user }
} = await supabase.auth.getUser()
```

然后使用真实 user.id 做权限校验。

---

## 24. 保存 Canvas 后端逻辑

```typescript
const {
  data: { user }
} = await supabase.auth.getUser()

if (!user) {
  return Response.json(
    {
      error: 'Unauthorized'
    },
    {
      status: 401
    }
  )
}
```

验证项目：

```typescript
const {
  data: project
} = await supabase
  .from('projects')
  .select('id')
  .eq('id', projectId)
  .eq('user_id', user.id)
  .single()
```

保存：

```typescript
await supabase
  .from('canvases')
  .update({
    canvas_data: canvasData
  })
  .eq('project_id', projectId)
  .eq('user_id', user.id)
```

---

## 25. Canvas 加载 API

```text
GET /api/projects/[id]/canvas
```

流程：

```text
读取登录用户
↓
查询 project
↓
确认 user_id
↓
查询 canvas
↓
返回 canvas_data
```

---

## 26. 项目列表查询

```typescript
const {
  data: projects
} = await supabase
  .from('projects')
  .select(`
    id,
    name,
    thumbnail_url,
    created_at,
    updated_at
  `)
  .order(
    'updated_at',
    {
      ascending: false
    }
  )
```

RLS 自动限制为当前用户自己的项目。

---

## 27. TypeScript 类型

### Project

```typescript
export interface Project {
  id: string
  user_id: string
  name: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}
```

### CanvasRecord

```typescript
export interface CanvasRecord {
  id: string
  project_id: string
  user_id: string
  canvas_data: unknown
  version: number
  created_at: string
  updated_at: string
}
```

### Asset

```typescript
export interface Asset {
  id: string
  user_id: string
  project_id: string
  name: string | null
  file_type: string
  mime_type: string | null
  file_url: string | null
  storage_path: string
  file_size: number | null
  width: number | null
  height: number | null
  created_at: string
}
```

---

## 28. Storage Bucket

创建：

```text
assets
```

推荐：

```text
Private Bucket
```

---

## 29. Storage 文件目录

```text
users/{userId}/projects/{projectId}/
```

例如：

```text
users/
  123456/
    projects/
      abc999/
        images/
        videos/
        files/
        thumbnails/
```

---

## 30. Storage RLS

读取：

```sql
create policy "Users can read own storage files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assets'
  and
  (storage.foldername(name))[1] = 'users'
  and
  (storage.foldername(name))[2] = auth.uid()::text
);
```

上传：

```sql
create policy "Users can upload own storage files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assets'
  and
  (storage.foldername(name))[1] = 'users'
  and
  (storage.foldername(name))[2] = auth.uid()::text
);
```

删除：

```sql
create policy "Users can delete own storage files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'assets'
  and
  (storage.foldername(name))[1] = 'users'
  and
  (storage.foldername(name))[2] = auth.uid()::text
);
```

更新：

```sql
create policy "Users can update own storage files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'assets'
  and
  (storage.foldername(name))[1] = 'users'
  and
  (storage.foldername(name))[2] = auth.uid()::text
);
```

---

## 31. 上传图片流程

```text
用户选择图片
↓
检查文件
↓
生成 storage_path
↓
上传 Supabase Storage
↓
创建 assets 数据
↓
获取 Signed URL
↓
加入 Canvas
↓
Canvas 自动保存
```

---

## 32. 上传文件限制

建议：

```text
图片：20MB
视频：200MB
普通文件：50MB
```

图片 MIME：

```text
image/jpeg
image/png
image/webp
image/gif
```

视频 MIME：

```text
video/mp4
video/webm
video/quicktime
```

---

## 33. Asset 类型约束

```sql
alter table public.assets
add constraint valid_asset_type
check (
  file_type in (
    'image',
    'video',
    'audio',
    'document',
    'other'
  )
);
```

---

## 34. AI 状态约束

```sql
alter table public.ai_generations
add constraint valid_ai_status
check (
  status in (
    'pending',
    'processing',
    'completed',
    'failed'
  )
);
```

---

## 35. AI 类型约束

```sql
alter table public.ai_generations
add constraint valid_generation_type
check (
  generation_type in (
    'chat',
    'image',
    'video',
    'image_edit'
  )
);
```

---

## 36. 项目名称约束

```sql
alter table public.projects
add constraint project_name_length
check (
  char_length(name) between 1 and 100
);
```

---

## 37. Supabase 客户端结构

```text
src/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
```

Browser Client：

```typescript
import {
  createBrowserClient
} from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Server Client：

```typescript
import {
  createServerClient
} from '@supabase/ssr'

import {
  cookies
} from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                )
              }
            )
          } catch {}
        }
      }
    }
  )
}
```

---

## 38. 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
```

禁止：

```text
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
```

Service Role 只能服务端使用。

---

## 39. .env.local

本地：

```text
.env.local
```

必须加入：

```text
.gitignore
```

禁止上传 GitHub。

---

## 40. 数据库 Migration

推荐：

```text
supabase/
  migrations/
    001_initial_schema.sql
    002_rls.sql
    003_storage.sql
```

---

## 41. 数据库安全规则

必须满足：

```text
前端不能自己决定 user_id
后端必须读取当前 session
所有表必须开启 RLS
Service Role 不允许出现在前端
AI API Key 不允许出现在前端
项目读取必须确认 owner
Storage 路径必须包含真实 user.id
```

---

## 42. 第一阶段验收

User A：

```text
创建 Project A
↓
projects.user_id = User A ID
↓
自动创建 canvases
↓
编辑 Canvas
↓
canvas_data 更新
↓
刷新
↓
Canvas 恢复
```

User B：

```text
不能读取 User A Projects
不能读取 User A Canvas
不能修改 User A Canvas
不能删除 User A Project
```

---

## 43. 完整初始化 SQL

```sql
-- ==========================================
-- EXTENSIONS
-- ==========================================

create extension if not exists pgcrypto;


-- ==========================================
-- PROFILES
-- ==========================================

create table public.profiles (

  id uuid primary key
    references auth.users(id)
    on delete cascade,

  username text,

  avatar_url text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()

);


-- ==========================================
-- PROJECTS
-- ==========================================

create table public.projects (

  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    default 'Untitled',

  thumbnail_url text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint project_name_length
    check (
      char_length(name)
      between 1 and 100
    )

);


-- ==========================================
-- CANVASES
-- ==========================================

create table public.canvases (

  id uuid primary key
    default gen_random_uuid(),

  project_id uuid not null unique
    references public.projects(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  canvas_data jsonb
    not null
    default '{}'::jsonb,

  version integer
    not null
    default 1,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()

);


-- ==========================================
-- ASSETS
-- ==========================================

create table public.assets (

  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  name text,

  file_type text not null,

  mime_type text,

  file_url text,

  storage_path text not null,

  file_size bigint,

  width integer,

  height integer,

  duration numeric,

  metadata jsonb
    not null
    default '{}'::jsonb,

  created_at timestamptz
    not null
    default now(),

  constraint valid_asset_type
    check (
      file_type in (
        'image',
        'video',
        'audio',
        'document',
        'other'
      )
    )

);


-- ==========================================
-- AI GENERATIONS
-- ==========================================

create table public.ai_generations (

  id uuid primary key
    default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  project_id uuid
    references public.projects(id)
    on delete cascade,

  generation_type text not null,

  provider text,

  model text,

  prompt text,

  negative_prompt text,

  status text
    not null
    default 'pending',

  result_url text,

  error_message text,

  metadata jsonb
    not null
    default '{}'::jsonb,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint valid_ai_status
    check (
      status in (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    ),

  constraint valid_generation_type
    check (
      generation_type in (
        'chat',
        'image',
        'video',
        'image_edit'
      )
    )

);


-- ==========================================
-- INDEXES
-- ==========================================

create index projects_user_id_idx
on public.projects(user_id);

create index projects_updated_at_idx
on public.projects(updated_at desc);

create index canvases_user_id_idx
on public.canvases(user_id);

create index canvases_project_id_idx
on public.canvases(project_id);

create index assets_user_id_idx
on public.assets(user_id);

create index assets_project_id_idx
on public.assets(project_id);

create index ai_generations_user_id_idx
on public.ai_generations(user_id);

create index ai_generations_project_id_idx
on public.ai_generations(project_id);


-- ==========================================
-- UPDATED AT FUNCTION
-- ==========================================

create or replace function
public.update_updated_at_column()

returns trigger

language plpgsql

as $$

begin

  new.updated_at = now();

  return new;

end;

$$;


-- ==========================================
-- UPDATED AT TRIGGERS
-- ==========================================

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

create trigger update_projects_updated_at
before update on public.projects
for each row
execute procedure public.update_updated_at_column();

create trigger update_canvases_updated_at
before update on public.canvases
for each row
execute procedure public.update_updated_at_column();

create trigger update_ai_generations_updated_at
before update on public.ai_generations
for each row
execute procedure public.update_updated_at_column();


-- ==========================================
-- AUTO CREATE PROFILE
-- ==========================================

create or replace function
public.handle_new_user()

returns trigger

language plpgsql

security definer

set search_path = ''

as $$

begin

  insert into public.profiles (
    id,
    username
  )

  values (

    new.id,

    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )

  );

  return new;

end;

$$;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();


-- ==========================================
-- ENABLE RLS
-- ==========================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.canvases enable row level security;
alter table public.assets enable row level security;
alter table public.ai_generations enable row level security;


-- ==========================================
-- PROFILE POLICIES
-- ==========================================

create policy "Users can view own profile"
on public.profiles
for select
using (
  auth.uid() = id
);

create policy "Users can update own profile"
on public.profiles
for update
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);


-- ==========================================
-- PROJECT POLICIES
-- ==========================================

create policy "Users can view own projects"
on public.projects
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own projects"
on public.projects
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own projects"
on public.projects
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own projects"
on public.projects
for delete
using (
  auth.uid() = user_id
);


-- ==========================================
-- CANVAS POLICIES
-- ==========================================

create policy "Users can view own canvases"
on public.canvases
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own canvases"
on public.canvases
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own canvases"
on public.canvases
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own canvases"
on public.canvases
for delete
using (
  auth.uid() = user_id
);


-- ==========================================
-- ASSET POLICIES
-- ==========================================

create policy "Users can view own assets"
on public.assets
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own assets"
on public.assets
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own assets"
on public.assets
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own assets"
on public.assets
for delete
using (
  auth.uid() = user_id
);


-- ==========================================
-- AI GENERATION POLICIES
-- ==========================================

create policy "Users can view own AI generations"
on public.ai_generations
for select
using (
  auth.uid() = user_id
);

create policy "Users can create own AI generations"
on public.ai_generations
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own AI generations"
on public.ai_generations
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can delete own AI generations"
on public.ai_generations
for delete
using (
  auth.uid() = user_id
);


-- ==========================================
-- CREATE PROJECT FUNCTION
-- ==========================================

create or replace function
public.create_project(
  project_name text default 'Untitled'
)

returns uuid

language plpgsql

security invoker

as $$

declare

  new_project_id uuid;

begin

  insert into public.projects (
    user_id,
    name
  )

  values (

    auth.uid(),

    coalesce(
      nullif(
        trim(project_name),
        ''
      ),
      'Untitled'
    )

  )

  returning id
  into new_project_id;


  insert into public.canvases (
    project_id,
    user_id,
    canvas_data
  )

  values (
    new_project_id,
    auth.uid(),
    '{}'::jsonb
  );


  return new_project_id;

end;

$$;
```

---

## 44. 开发完成后的数据结构

```text
Supabase
│
├── Auth
│    └── users
│
├── Database
│    │
│    ├── profiles
│    ├── projects
│    ├── canvases
│    ├── assets
│    └── ai_generations
│
└── Storage
     └── assets
          └── users
               └── {userId}
                    └── projects
                         └── {projectId}
                              ├── images
                              ├── videos
                              ├── files
                              └── thumbnails
```

---

## 45. MVP 数据闭环

```text
注册
↓
auth.users
↓
profiles
↓
创建项目
↓
projects
↓
canvases
↓
进入 Canvas
↓
修改
↓
canvas_data
↓
自动保存
↓
关闭网页
↓
重新登录
↓
projects
↓
读取 canvas_data
↓
恢复画布
```

---

## 46. 下一开发文档

```text
03-前后端目录-API接口-NextJS开发文档.md
```
