-- 创建 canvases 表
-- canvas_data 存储完整的 CanvasProject 数据（nodes, connections, viewport 等）
create table if not exists public.canvases (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    canvas_data jsonb not null default '{}'::jsonb,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(project_id)
);

-- 启用 RLS
alter table public.canvases enable row level security;

-- 策略：用户可以查看自己项目的 canvas
create policy "Users can view own canvases"
    on public.canvases for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 策略：用户可以更新自己项目的 canvas
create policy "Users can update own canvases"
    on public.canvases for update
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 策略：用户可以删除自己项目的 canvas
create policy "Users can delete own canvases"
    on public.canvases for delete
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 策略：用户可以创建 canvas（项目必须是自己的）
create policy "Users can create canvases"
    on public.canvases for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 自动更新 updated_at 的触发器
create trigger on_canvas_updated
    before update on public.canvases
    for each row execute procedure public.handle_updated_at();

-- 索引：按 project_id 查询
create index idx_canvases_project_id on public.canvases(project_id);
