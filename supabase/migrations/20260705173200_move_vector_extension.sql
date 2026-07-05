-- Address Supabase security advisor: extensions should not live in the public schema
create schema if not exists extensions;
alter extension vector set schema extensions;
