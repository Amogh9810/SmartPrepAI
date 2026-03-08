# SmartPrep AI - Supabase Setup Guide

Run these SQL commands in the Supabase SQL Editor to set up the database schema.

## Step 1: Create User Profiles Table

```sql
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  profile_picture_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_profiles enable row level security;

create policy "users_can_view_own_profile" on public.user_profiles for select using (auth.uid() = id);
create policy "users_can_update_own_profile" on public.user_profiles for update using (auth.uid() = id);
```

## Step 2: Create Subjects Table

```sql
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.subjects enable row level security;

create policy "users_can_view_own_subjects" on public.subjects for select using (auth.uid() = user_id);
create policy "users_can_create_subjects" on public.subjects for insert with check (auth.uid() = user_id);
create policy "users_can_update_own_subjects" on public.subjects for update using (auth.uid() = user_id);
create policy "users_can_delete_own_subjects" on public.subjects for delete using (auth.uid() = user_id);
```

## Step 3: Create Topics Table

```sql
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.topics enable row level security;

create policy "users_can_view_own_topic" on public.topics for select using (
  subject_id in (select id from public.subjects where auth.uid() = user_id)
);
create policy "users_can_create_topic" on public.topics for insert with check (
  subject_id in (select id from public.subjects where auth.uid() = user_id)
);
create policy "users_can_update_own_topic" on public.topics for update using (
  subject_id in (select id from public.subjects where auth.uid() = user_id)
);
create policy "users_can_delete_own_topic" on public.topics for delete using (
  subject_id in (select id from public.subjects where auth.uid() = user_id)
);
```

## Step 4: Create Questions Table

```sql
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question_text text not null,
  answer_text text not null,
  difficulty text default 'medium',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.questions enable row level security;

create policy "users_can_view_own_questions" on public.questions for select using (
  topic_id in (
    select id from public.topics 
    where subject_id in (select id from public.subjects where auth.uid() = user_id)
  )
);
create policy "users_can_create_questions" on public.questions for insert with check (
  topic_id in (
    select id from public.topics 
    where subject_id in (select id from public.subjects where auth.uid() = user_id)
  )
);
create policy "users_can_update_own_questions" on public.questions for update using (
  topic_id in (
    select id from public.topics 
    where subject_id in (select id from public.subjects where auth.uid() = user_id)
  )
);
create policy "users_can_delete_own_questions" on public.questions for delete using (
  topic_id in (
    select id from public.topics 
    where subject_id in (select id from public.subjects where auth.uid() = user_id)
  )
);
```

## Step 5: Create Quiz Results Table

```sql
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  score numeric not null,
  total_questions integer not null,
  time_spent_seconds integer,
  completed_at timestamp with time zone default now()
);

alter table public.quiz_results enable row level security;

create policy "users_can_view_own_results" on public.quiz_results for select using (auth.uid() = user_id);
create policy "users_can_create_results" on public.quiz_results for insert with check (auth.uid() = user_id);
```

## Step 6: Create Study Sessions Table

```sql
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  duration_minutes integer,
  focus_score numeric,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.study_sessions enable row level security;

create policy "users_can_view_own_sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "users_can_create_sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "users_can_update_own_sessions" on public.study_sessions for update using (auth.uid() = user_id);
```

## Step 7: Create Study Schedules Table

```sql
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  study_date date not null,
  duration_minutes integer,
  priority text default 'medium',
  completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.schedules enable row level security;

create policy "users_can_view_own_schedules" on public.schedules for select using (auth.uid() = user_id);
create policy "users_can_create_schedules" on public.schedules for insert with check (auth.uid() = user_id);
create policy "users_can_update_own_schedules" on public.schedules for update using (auth.uid() = user_id);
```

## Step 8: Create Profile Trigger

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

After running all these commands, your database will be ready for the SmartPrep AI application.
