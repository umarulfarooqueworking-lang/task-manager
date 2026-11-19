-- ==============================================================================
-- TaskFlow Database Schema (Supabase PostgreSQL)
-- ==============================================================================

-- 1. Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('admin', 'manager', 'employee')),
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. Create tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  creator_id uuid references public.profiles(id) not null,
  assignee_id uuid references public.profiles(id) not null,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'approved', 'rejected')),
  report_content text,
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Create indexes for high query performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_manager_id on public.profiles(manager_id);
create index if not exists idx_tasks_creator_id on public.tasks(creator_id);
create index if not exists idx_tasks_assignee_id on public.tasks(assignee_id);
create index if not exists idx_tasks_status on public.tasks(status);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- 5. Helper function to get current user role without recursive RLS loop
create or replace function public.get_user_role(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = p_user_id;
$$;

-- 6. Trigger to auto-update updated_at on tasks table
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.handle_updated_at();

-- 7. Trigger to auto-create profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_full_name text;
  v_manager_id uuid;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'employee');
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  if new.raw_user_meta_data->>'manager_id' is not null and new.raw_user_meta_data->>'manager_id' <> '' then
    v_manager_id := (new.raw_user_meta_data->>'manager_id')::uuid;
  else
    v_manager_id := null;
  end if;

  insert into public.profiles (id, email, full_name, role, manager_id, created_at)
  values (new.id, new.email, v_full_name, v_role, v_manager_id, now())
  on conflict (id) do update
  set 
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    manager_id = coalesce(excluded.manager_id, profiles.manager_id);
    
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ==============================================================================
-- 8. Row Level Security (RLS) Policies: profiles
-- ==============================================================================

-- Drop existing policies if any
drop policy if exists "Admins have full access to profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Managers can view assigned employees" on public.profiles;
drop policy if exists "Employees can view their manager profile" on public.profiles;
drop policy if exists "Authenticated users can read basic profiles" on public.profiles;

-- Admin: full CRUD
create policy "Admins have full access to profiles"
on public.profiles
for all
to authenticated
using (
  public.get_user_role(auth.uid()) = 'admin'
)
with check (
  public.get_user_role(auth.uid()) = 'admin'
);

-- Authenticated users can view their own profile
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

-- Managers can view employees assigned to them, as well as themselves
create policy "Managers can view assigned employees"
on public.profiles
for select
to authenticated
using (
  public.get_user_role(auth.uid()) = 'manager' 
  and (manager_id = auth.uid() or id = auth.uid())
);

-- Employees can view their manager's profile
create policy "Employees can view their manager profile"
on public.profiles
for select
to authenticated
using (
  public.get_user_role(auth.uid()) = 'employee'
  and id in (select manager_id from public.profiles where id = auth.uid())
);

-- General read for task creator / assignee name lookup
create policy "Authenticated users can read basic profiles"
on public.profiles
for select
to authenticated
using (
  auth.role() = 'authenticated'
);

-- ==============================================================================
-- 9. Row Level Security (RLS) Policies: tasks
-- ==============================================================================

drop policy if exists "Admin full read access on tasks" on public.tasks;
drop policy if exists "Manager can view created tasks" on public.tasks;
drop policy if exists "Manager can insert tasks for their employees" on public.tasks;
drop policy if exists "Manager can update tasks they created" on public.tasks;
drop policy if exists "Employee can view assigned tasks" on public.tasks;
drop policy if exists "Employee can submit reports on their tasks" on public.tasks;

-- Admin: read-only on all tasks
create policy "Admin full read access on tasks"
on public.tasks
for select
to authenticated
using (
  public.get_user_role(auth.uid()) = 'admin'
);

-- Manager: can view tasks they created
create policy "Manager can view created tasks"
on public.tasks
for select
to authenticated
using (
  creator_id = auth.uid()
);

-- Manager: can create tasks assigned to their employees
create policy "Manager can insert tasks for their employees"
on public.tasks
for insert
to authenticated
with check (
  creator_id = auth.uid()
  and public.get_user_role(auth.uid()) = 'manager'
);

-- Manager: can update tasks they created (e.g. approve/reject, review)
create policy "Manager can update tasks they created"
on public.tasks
for update
to authenticated
using (
  creator_id = auth.uid()
)
with check (
  creator_id = auth.uid()
);

-- Employee: can view tasks assigned to them
create policy "Employee can view assigned tasks"
on public.tasks
for select
to authenticated
using (
  assignee_id = auth.uid()
);

-- Employee: can submit report content on tasks assigned to them
create policy "Employee can submit reports on their tasks"
on public.tasks
for update
to authenticated
using (
  assignee_id = auth.uid()
)
with check (
  assignee_id = auth.uid()
);
