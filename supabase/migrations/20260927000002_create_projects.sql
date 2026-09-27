-- 创建 projects 表
create table if not exists public.projects (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 启用 RLS
alter table public.projects enable row level security;

-- 策略：用户可以查看自己的项目
create policy "Users can view own projects"
    on public.projects for select
    using (auth.uid() = owner_id);

-- 策略：用户可以更新自己的项目
create policy "Users can update own projects"
    on public.projects for update
    using (auth.uid() = owner_id);

-- 策略：用户可以删除自己的项目
create policy "Users can delete own projects"
    on public.projects for delete
    using (auth.uid() = owner_id);

-- 策略：用户可以创建项目（owner_id 必须是自己）
create policy "Users can create projects"
    on public.projects for insert
    with check (auth.uid() = owner_id);

-- 自动更新 updated_at 的触发器
create trigger on_project_updated
    before update on public.projects
    for each row execute procedure public.handle_updated_at();

-- 索引：按 owner_id 查询
create index idx_projects_owner_id on public.projects(owner_id);

-- 索引：按 updated_at 排序
create index idx_projects_updated_at on public.projects(updated_at desc);
