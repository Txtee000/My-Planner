create table public.timeline_items(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    category_id uuid not null,

    title text not null,


    start_date date not null,
    start_time time null,
    end_date date null,
    end_time time null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    description text null,
   

    constraint timelines_time_check check (
        end_date is null
        or end_date >= start_date
    ),



    foreign key (user_id) references public.accounts (id) on delete restrict,
    foreign key (category_id) references public.task_categories (id) on delete cascade

)

