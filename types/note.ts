import { Dispatch, SetStateAction } from "react";
export type NoteFilterValue = {
    id: string;
    name: string;
    type: "folder" | "file";
    parentId?: string | null;
    category_ids: string[];
    content?: string | null;
    isFavorite: boolean;
    updated_at: string;
    slug?: string | null;
    custom_filter_id?: string | null;
    is_table_mode?: boolean;
}


export type NoteItemProps ={
    item: NoteFilterValue; 
    setCurrentFolder: React.Dispatch<React.SetStateAction<NoteFilterValue[]>>;
    currentFolder: NoteFilterValue[];
    handleEdit: (item: NoteFilterValue) => void;
    handleDelete: (id: string) => void;
    
}