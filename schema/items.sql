-- 1. สร้าง ENUM Type สำหรับประเภทของ Item
CREATE TYPE item_type AS ENUM ('folder', 'file', 'task');

-- 2. สร้างตารางหลัก (items)
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- เชื่อม Foreign Key กับ public.accounts ตามโค้ดเก่า
    user_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT, 
    parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ใช้ name แทน title เพื่อให้ครอบคลุมทั้ง file และ folder
    type item_type NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- สร้าง Index เพื่อความเร็วในการ Query
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_parent_id ON items(parent_id);

-- 3. สร้างตารางย่อยสำหรับ Task (นำ Constraint และฟิลด์จากโค้ดเก่ามาใส่)
CREATE TABLE tasks (
    item_id UUID PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    position INT NOT NULL,
    
    -- ใช้ Constraint CHECK จากของเก่า
    task_status TEXT NULL DEFAULT 'not_started' 
        CONSTRAINT task_status_check CHECK (task_status IN ('not_started', 'in_progress', 'done')),
    
    description TEXT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT true,
    
    -- นำ startTime และ endTime มาเปลี่ยนเป็น snake_case (start_time, end_time) ตามมาตรฐาน PostgreSQL
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    deadline_day DATE -- ยังคงเก็บไว้เผื่อต้องระบุวันที่สิ้นสุดของงาน
);

-- 4. สร้างตารางย่อยสำหรับ File
CREATE TABLE files (
    item_id UUID PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    description TEXT,
    link TEXT
);