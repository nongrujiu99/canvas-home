-- ============================================================
-- AI 无限画布 — 幂等初始化脚本
-- 适用于：全新 Supabase 项目 / 初始化到一半的开发数据库
-- 在 SQL Editor 中一次 Run 即可
-- ============================================================

BEGIN;

-- ==========================================
-- 清理：按安全依赖顺序删除旧对象
-- 不动 auth.users 本身，只删我们创建的 trigger
-- ==========================================

-- 1. auth.users 上我们创建的 trigger
drop trigger if exists on_auth_user_created on auth.users;

-- 2. 业务表（子表先删，CASCADE 自动移除表上依赖 handle_updated_at 的 triggers）
drop table if exists public.ai_generations cascade;
drop table if exists public.assets cascade;
drop table if exists public.canvases cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- 3. 我们自己创建的 functions（表已删，无残留依赖）
drop function if exists public.create_project(text, text);
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();

-- ==========================================
-- 重建：profiles
-- ==========================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text,
    avatar_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- 公共函数：自动更新 updated_at
create function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

-- 新用户注册时自动创建 profile
create function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, avatar_url)
    values (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==========================================
-- 重建：projects
-- ==========================================
create table public.projects (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
    on public.projects for select
    using (auth.uid() = owner_id);

create policy "Users can update own projects"
    on public.projects for update
    using (auth.uid() = owner_id);

create policy "Users can delete own projects"
    on public.projects for delete
    using (auth.uid() = owner_id);

create policy "Users can create projects"
    on public.projects for insert
    with check (auth.uid() = owner_id);

create trigger on_project_updated
    before update on public.projects
    for each row execute procedure public.handle_updated_at();

create index idx_projects_owner_id on public.projects(owner_id);
create index idx_projects_updated_at on public.projects(updated_at desc);

-- ==========================================
-- 重建：canvases
-- ==========================================
create table public.canvases (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    canvas_data jsonb not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(project_id)
);

alter table public.canvases enable row level security;

create policy "Users can view own canvases"
    on public.canvases for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can update own canvases"
    on public.canvases for update
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can delete own canvases"
    on public.canvases for delete
    using (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can create canvases"
    on public.canvases for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = canvases.project_id
            and projects.owner_id = auth.uid()
        )
    );

create trigger on_canvas_updated
    before update on public.canvases
    for each row execute procedure public.handle_updated_at();

create index idx_canvases_project_id on public.canvases(project_id);

-- ==========================================
-- 重建：assets
-- ==========================================
create table public.assets (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    storage_path text not null,
    mime_type text not null,
    size bigint not null,
    created_at timestamptz default now() not null
);

alter table public.assets enable row level security;

create policy "Users can view own assets"
    on public.assets for select
    using (auth.uid() = owner_id);

create policy "Users can delete own assets"
    on public.assets for delete
    using (auth.uid() = owner_id);

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

create index idx_assets_project_id on public.assets(project_id);
create index idx_assets_owner_id on public.assets(owner_id);

-- ==========================================
-- 重建：ai_generations
-- ==========================================
create table public.ai_generations (
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

alter table public.ai_generations enable row level security;

create policy "Users can view own ai_generations"
    on public.ai_generations for select
    using (auth.uid() = owner_id);

create policy "Users can update own ai_generations"
    on public.ai_generations for update
    using (auth.uid() = owner_id);

create policy "Users can delete own ai_generations"
    on public.ai_generations for delete
    using (auth.uid() = owner_id);

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

create trigger on_ai_generation_updated
    before update on public.ai_generations
    for each row execute procedure public.handle_updated_at();

create index idx_ai_generations_project_id on public.ai_generations(project_id);
create index idx_ai_generations_owner_id on public.ai_generations(owner_id);
create index idx_ai_generations_status on public.ai_generations(status);

-- ==========================================
-- 重建：create_project RPC（最终版本）
-- 创建项目时写入合法 CanvasProject JSON
-- ==========================================
create function public.create_project(
    project_name text,
    project_description text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
    current_user_id uuid;
    new_project_id uuid;
    now_ts timestamptz;
begin
    current_user_id := auth.uid();

    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if project_name is null or trim(project_name) = '' then
        raise exception 'Project name cannot be empty';
    end if;

    now_ts := now();

    insert into public.projects (owner_id, name, description, created_at, updated_at)
    values (current_user_id, trim(project_name), trim(project_description), now_ts, now_ts)
    returning id into new_project_id;

    insert into public.canvases (project_id, canvas_data, created_at, updated_at)
    values (
        new_project_id,
        jsonb_build_object(
            'id', new_project_id,
            'title', trim(project_name),
            'createdAt', to_char(now_ts, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
            'updatedAt', to_char(now_ts, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
            'nodes', '[]'::jsonb,
            'connections', '[]'::jsonb,
            'backgroundMode', '"lines"'::jsonb,
            'showImageInfo', 'false'::jsonb,
            'viewport', jsonb_build_object('x', 0, 'y', 0, 'k', 1)
        ),
        now_ts,
        now_ts
    );

    return new_project_id;
end;
$$;

-- ==========================================
-- API Grants
-- ==========================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles, public.projects, public.canvases, public.assets, public.ai_generations to authenticated;
revoke all on table public.profiles, public.projects, public.canvases, public.assets, public.ai_generations from anon;
revoke execute on function public.create_project(text, text) from public;
grant execute on function public.create_project(text, text) to authenticated;

COMMIT;
