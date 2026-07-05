-- Address Supabase security advisor: trigger function should not be publicly callable via RPC
revoke execute on function public.handle_new_user() from anon, authenticated, public;
