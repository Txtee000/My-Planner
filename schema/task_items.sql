create table public.task_items(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    category_id uuid not null,
    title text not null,
    position int not null,
    startTime Time not null,
    endTime Time not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    task_status text null default 'not_started',
    


    constraint task_status_check check(
        task_status in ('not_started', 'in_progress', 'done')
    ),



    foreign key (user_id) references public.accounts (id) on delete restrict,
    foreign key (category_id) references public.task_categories (id) on delete cascade

)


alter table public.tasks
add column description text null;

alter table public.tasks
add column is_all_day boolean not null default true;