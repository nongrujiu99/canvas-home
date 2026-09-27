-- 创建 assets 表
-- 存储项目中使用的资源（图片、视频、音频等）的元数据
create table if not exists public.assets (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    storage_path text not null,
    mime_type text not null,
    size bigint not null,
    created_at timestamptz default now() not null
);

-- 启用 RLS
alter table public.assets enable row level security;

-- 策略：用户可以查看自己的资源
create policy "Users can view own assets"
    on public.assets for select
    using (auth.uid() = owner_id);

-- 策略：用户可以删除自己的资源
create policy "Users can delete own assets"
    on public.assets for delete
    using (auth.uid() = owner_id);

-- 策略：用户可以创建资源（owner_id 必须是自己，project 必须是自己的）
create policy "Users can create assets"
    on public.assets for insert
    with check (
        auth.uid() = owner_id
        and exists (
            select 1 from public.projects
            where projects.id = assets.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 索引：按 project_id 查询
create index idx_assets_project_id on public.assets(project_id);

-- 索引：按 owner_id 查询
create index idx_assets_owner_id on public.assets(owner_id);
