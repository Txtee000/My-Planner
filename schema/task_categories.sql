create table public.task_categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    task_type text not null default 'task',
    title text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    color_hex text not null default '#6b7280',

    constraint item_type_check check (
        task_type in ('task', 'activity')
    ),
     constraint color_hex_check check (
        color_hex ~ '^#[0-9A-Fa-f]{6}$'
    ),

    foreign key (user_id) references public.accounts (id) on delete cascade
);


alter table public.task_categories
add column task_group text null;

alter table public.task_categories
add constraint task_categories_task_group_check
check (
    (
        task_type = 'task'
        and task_group in ('study', 'work')
    )
    or
    (
        task_type = 'activity'
        and task_group is null
    )
);