-- 2. สร้างตารางกลางเพื่อเชื่อมความสัมพันธ์แบบ Many-to-Many
create table public.task_item_categories (
    task_item_id uuid not null,
    category_id uuid not null,
    created_at timestamptz not null default now(),
    
    -- กำหนดให้คู่ของสองตัวนี้เป็น Primary Key ร่วมกัน (ป้องกันการผูกหมวดหมู่ซ้ำใน Task เดิม)
    primary key (task_item_id, category_id),
    
    -- ทำ Foreign Key เชื่อมไปยังตารางต้นทาง
    foreign key (task_item_id) references public.task_items (id) on delete cascade,
    foreign key (category_id) references public.task_categories (id) on delete cascade
);

-- 3. ทำ Index ที่ category_id เพื่อให้เวลาใช้ Filter หมวดหมู่ทำงานได้เร็วขึ้นมากๆ
create index idx_task_item_categories_category_id on public.task_item_categories(category_id);