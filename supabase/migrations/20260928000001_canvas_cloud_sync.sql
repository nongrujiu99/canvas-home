-- 阶段 5：统一 Project ID + Canvas 云端持久化
-- 1. 更新 create_project RPC，写入合法 CanvasProject JSON
-- 2. Backfill 已有 canvas_data = '{}' 的记录
-- 3. 移除 canvases.canvas_data 的 '{}' 默认值

-- ==========================================
-- 1. 更新 create_project RPC
-- ==========================================
create or replace function public.create_project(
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
-- 2. Backfill 已有 canvas_data = '{}' 的记录
-- ==========================================
update public.canvases
set canvas_data = jsonb_build_object(
    'id', canvases.project_id,
    'title', coalesce(projects.name, 'Untitled'),
    'createdAt', to_char(canvases.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'updatedAt', to_char(canvases.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'nodes', '[]'::jsonb,
    'connections', '[]'::jsonb,
    'backgroundMode', '"lines"'::jsonb,
    'showImageInfo', 'false'::jsonb,
    'viewport', jsonb_build_object('x', 0, 'y', 0, 'k', 1)
),
updated_at = now()
from public.projects
where canvases.project_id = projects.id
  and canvases.canvas_data = '{}'::jsonb;

-- ==========================================
-- 3. 移除 '{}' 默认值，强制创建时明确提供合法数据
-- ==========================================
alter table public.canvases alter column canvas_data drop default;
