create table public.accounts (
    id uuid primary key default gen_random_uuid(),

    username text not null,
    email text not null,
    google_subject text null, --เก็บ Google account id
    avatar_url text null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);