-- Bridges Supabase Auth (auth.users) to our public.users profile row on GitHub OAuth signup (FR-1.1)
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, github_id, username)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'provider_id')::bigint,
    new.raw_user_meta_data ->> 'user_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
