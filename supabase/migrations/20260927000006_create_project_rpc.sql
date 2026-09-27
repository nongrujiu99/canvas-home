-- 创建项目 RPC 函数
-- 在一个事务中同时创建 projects 和 canvases 记录
-- 使用 SECURITY INVOKER 确保以调用者身份执行
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
begin
    -- 获取当前用户 ID
    current_user_id := auth.uid();
    
    -- 验证用户已登录
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;
    
    -- 验证项目名称不为空
    if project_name is null or trim(project_name) = '' then
        raise exception 'Project name cannot be empty';
    end if;
    
    -- 创建项目
    insert into public.projects (owner_id, name, description)
    values (current_user_id, trim(project_name), trim(project_description))
    returning id into new_project_id;
    
    -- 创建对应的 canvas（空数据）
    insert into public.canvases (project_id, canvas_data)
    values (new_project_id, '{}'::jsonb);
    
    -- 返回项目 ID
    return new_project_id;
end;
$$;
