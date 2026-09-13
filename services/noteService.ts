type NoteItemParams = {
  name?: string;
  type?: "folder" | "file";
  parentId?: string | null;
  category_ids?: string[];
  content?: string;
};

export async function getNoteItems(params: NoteItemParams = {}) {
  
  const searchParams = new URLSearchParams();

  if(params.name){
    searchParams.set("query", params.name)
  }
  if(params.type){
    searchParams.set("type", params.type);
  }
  if(params.parentId){
    searchParams.set("parent_id", params.parentId);
  }
  if(params.category_ids && params.category_ids.length > 0){
    searchParams.set("category_ids", params.category_ids.join(","));
  }
  if(params.content){
    searchParams.set("content", params.content);
  }

  const queryString = searchParams.toString();

  const response = await fetch(`/api/notes_page?${queryString}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch note items");
  }

  const resData = await response.json();
  return resData.data || [];
}

export async function addNoteItem(name: string, type: string, parentId: string | null, slug?: string | null) {
  const response = await fetch(`/api/notes_page`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      parentId,
      slug,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add note item");
  }

  return;
}

export async function updateNoteItem(params: {
  id: string;
  name?: string;
  content?: string;
  is_favorite?: boolean;
  category_ids?: string[];
  slug?: string | null;
}) {
  const response = await fetch(`/api/notes_page`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update note item");
  }

  const resData = await response.json();
  return resData.data;
}

export async function deleteNoteItem(id: string) {
  const response = await fetch(`/api/notes_page
    `, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete note item");
  }

  const resData = await response.json();
  return resData.data;
}
