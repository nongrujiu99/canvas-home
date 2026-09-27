-- 创建 profiles 表
-- 与 Supabase Auth 的 auth.users 关联
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text,
    avatar_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 启用 RLS
alter table public.profiles enable row level security;

-- 策略：用户可以查看自己的 profile
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

-- 策略：用户可以更新自己的 profile
create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- 策略：用户插入时只能是自己的 id
create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- 自动更新 updated_at 的触发器
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

-- 当新用户注册时自动创建 profile
create or replace function public.handle_new_user()
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
