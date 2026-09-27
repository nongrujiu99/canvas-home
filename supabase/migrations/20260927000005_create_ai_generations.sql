-- 创建 ai_generations 表
-- 存储 AI 生成任务的记录
create table if not exists public.ai_generations (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    node_id text not null,
    prompt text,
    result_url text,
    status text not null default 'pending',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 启用 RLS
alter table public.ai_generations enable row level security;

-- 策略：用户可以查看自己的生成记录
create policy "Users can view own ai_generations"
    on public.ai_generations for select
    using (auth.uid() = owner_id);

-- 策略：用户可以更新自己的生成记录
create policy "Users can update own ai_generations"
    on public.ai_generations for update
    using (auth.uid() = owner_id);

-- 策略：用户可以删除自己的生成记录
create policy "Users can delete own ai_generations"
    on public.ai_generations for delete
    using (auth.uid() = owner_id);

-- 策略：用户可以创建生成记录（owner_id 必须是自己，project 必须是自己的）
create policy "Users can create ai_generations"
    on public.ai_generations for insert
    with check (
        auth.uid() = owner_id
        and exists (
            select 1 from public.projects
            where projects.id = ai_generations.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- 自动更新 updated_at 的触发器
create trigger on_ai_generation_updated
    before update on public.ai_generations
    for each row execute procedure public.handle_updated_at();

-- 索引：按 project_id 查询
create index idx_ai_generations_project_id on public.ai_generations(project_id);

-- 索引：按 owner_id 查询
create index idx_ai_generations_owner_id on public.ai_generations(owner_id);

-- 索引：按 status 查询
create index idx_ai_generations_status on public.ai_generations(status);
