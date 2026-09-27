grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles, public.projects, public.canvases, public.assets, public.ai_generations to authenticated;
revoke all on table public.profiles, public.projects, public.canvases, public.assets, public.ai_generations from anon;
revoke execute on function public.create_project(text, text) from public;
grant execute on function public.create_project(text, text) to authenticated;
