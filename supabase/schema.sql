-- ============================================================
-- Halfway — Supabase schema
-- Incolla tutto questo file in: Supabase → SQL Editor → New query
-- poi clicca "Run".
-- ============================================================

-- Estensione per generare UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES (un profilo per ogni utente registrato)
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'New user',
  country text not null default '',
  bio text not null default '',
  avatar_url text,
  native_language text not null default 'Italian',
  learning_language text not null default 'Japanese',
  push_notifications boolean not null default true,
  email_notifications boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Crea automaticamente un profilo quando qualcuno si registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  insert into public.learning_progress (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- LEARNING PROGRESS (streak, parole imparate, ecc.)
-- ------------------------------------------------------------
create table if not exists learning_progress (
  user_id uuid primary key references profiles (id) on delete cascade,
  words_learned int not null default 0,
  streak int not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table learning_progress enable row level security;

create policy "Users can view their own progress"
  on learning_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on learning_progress for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on learning_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- VOCABULARY PROGRESS (parole salvate e/o imparate)
-- ------------------------------------------------------------
create table if not exists vocabulary_progress (
  user_id uuid references profiles (id) on delete cascade,
  vocabulary_id text not null,
  saved boolean not null default false,
  learned boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

alter table vocabulary_progress enable row level security;

create policy "Users can view their own vocabulary progress"
  on vocabulary_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can manage their own vocabulary progress"
  on vocabulary_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Aggiorna automaticamente streak e parole imparate quando una parola
-- viene segnata come "learned" per la prima volta.
create or replace function public.bump_streak(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  last_date date;
begin
  select last_activity_date into last_date from learning_progress where user_id = p_user_id;

  if last_date is null then
    update learning_progress
    set streak = 1, last_activity_date = current_date, updated_at = now()
    where user_id = p_user_id;
  elsif last_date = current_date then
    null; -- già contato oggi
  elsif last_date = current_date - 1 then
    update learning_progress
    set streak = streak + 1, last_activity_date = current_date, updated_at = now()
    where user_id = p_user_id;
  else
    update learning_progress
    set streak = 1, last_activity_date = current_date, updated_at = now()
    where user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.handle_vocabulary_learned()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.learned)
     or (tg_op = 'UPDATE' and new.learned and not coalesce(old.learned, false)) then
    update learning_progress
    set words_learned = words_learned + 1
    where user_id = new.user_id;

    perform public.bump_streak(new.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_vocabulary_learned on vocabulary_progress;
create trigger on_vocabulary_learned
  after insert or update on vocabulary_progress
  for each row execute procedure public.handle_vocabulary_learned();

-- ------------------------------------------------------------
-- POSTS (community feed)
-- ------------------------------------------------------------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now()
);

alter table posts enable row level security;

create policy "Posts are viewable by authenticated users"
  on posts for select
  to authenticated
  using (true);

create policy "Users can create their own posts"
  on posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- POST LIKES
-- ------------------------------------------------------------
create table if not exists post_likes (
  post_id uuid references posts (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table post_likes enable row level security;

create policy "Likes are viewable by authenticated users"
  on post_likes for select
  to authenticated
  using (true);

create policy "Users can manage their own likes"
  on post_likes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- POST COMMENTS
-- ------------------------------------------------------------
create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table post_comments enable row level security;

create policy "Comments are viewable by authenticated users"
  on post_comments for select
  to authenticated
  using (true);

create policy "Users can create their own comments"
  on post_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on post_comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- CONNECTIONS (chi è collegato con chi)
-- ------------------------------------------------------------
create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles (id) on delete cascade,
  user_b uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint distinct_users check (user_a <> user_b),
  constraint ordered_pair check (user_a < user_b),
  unique (user_a, user_b)
);

alter table connections enable row level security;

create policy "Users can view their own connections"
  on connections for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can create connections involving themselves"
  on connections for insert
  to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- ------------------------------------------------------------
-- CONVERSATIONS + MESSAGES (chat privata realtime)
-- ------------------------------------------------------------
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles (id) on delete cascade,
  user_b uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint distinct_users_conv check (user_a <> user_b),
  constraint ordered_pair_conv check (user_a < user_b),
  unique (user_a, user_b)
);

alter table conversations enable row level security;

create policy "Users can view their own conversations"
  on conversations for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can create conversations involving themselves"
  on conversations for insert
  to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  media_url text,
  media_type text check (media_type in ('audio')),
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- Abilita le pubblicazioni realtime per la chat
-- ------------------------------------------------------------
alter publication supabase_realtime add table messages;

-- ------------------------------------------------------------
-- EXCHANGE SESSIONS (proposte di scambio linguistico programmato)
-- ------------------------------------------------------------
create table if not exists exchange_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  proposed_by uuid not null references profiles (id) on delete cascade,
  scheduled_at timestamptz not null,
  note text,
  status text not null default 'proposed' check (status in ('proposed', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table exchange_sessions enable row level security;

create policy "Users can view sessions in their conversations"
  on exchange_sessions for select
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Users can propose sessions in their conversations"
  on exchange_sessions for insert
  to authenticated
  with check (
    auth.uid() = proposed_by
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Users can update sessions in their conversations"
  on exchange_sessions for update
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

alter publication supabase_realtime add table exchange_sessions;

-- ------------------------------------------------------------
-- STORAGE: bucket per i messaggi vocali
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

create policy "Public read access for chat media"
  on storage.objects for select
  to public
  using (bucket_id = 'chat-media');

create policy "Authenticated users can upload chat media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- STORAGE: bucket per gli avatar dei profili
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read access for avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- STORAGE: bucket per le immagini/video dei post
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Public read access for post images"
  on storage.objects for select
  to public
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload their own post images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own post images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- VISTE DI COMODO (join già pronti per l'app)
-- ------------------------------------------------------------

-- Feed dei post con nome autore, conteggio like/commenti, e se piace a me
create or replace view posts_feed as
select
  p.id,
  p.author_id,
  p.content,
  p.media_url,
  p.media_type,
  p.created_at,
  pr.name as author_name,
  pr.country as author_country,
  pr.avatar_url as author_avatar_url,
  coalesce(l.like_count, 0) as like_count,
  coalesce(c.comment_count, 0) as comment_count,
  exists (
    select 1 from post_likes pl
    where pl.post_id = p.id and pl.user_id = auth.uid()
  ) as liked_by_me
from posts p
join profiles pr on pr.id = p.author_id
left join (
  select post_id, count(*) as like_count from post_likes group by post_id
) l on l.post_id = p.id
left join (
  select post_id, count(*) as comment_count from post_comments group by post_id
) c on c.post_id = p.id
order by p.created_at desc;

-- Le mie conversazioni con anteprima dell'ultimo messaggio
create or replace view my_conversations as
select
  c.id,
  c.user_a,
  c.user_b,
  c.created_at,
  case when c.user_a = auth.uid() then c.user_b else c.user_a end as other_user_id,
  (
    select content from messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) as last_message,
  (
    select created_at from messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) as last_message_at
from conversations c
where c.user_a = auth.uid() or c.user_b = auth.uid();

