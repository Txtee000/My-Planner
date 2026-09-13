"use client";

import { addNoteItem, deleteNoteItem, getNoteItems } from "@/services/noteService";
import { useEffect, useState, useRef } from "react";
import { NoteItem } from "./note_item";
import { CreateNote } from "./create_note";
import {NoteFilterValue} from "@/types/note"
import { EditNoteItem } from "./edit_note_item";


export function NotesPage() {
  const [search, setSearch] = useState("");
  const [noteItems, setNoteItems] = useState<NoteFilterValue[]>([]);
  const [createNote, setCreateNote] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<NoteFilterValue[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState<NoteFilterValue | null>(null);
  

  const newDropdownRef = useRef<HTMLDivElement>(null);
  

  const THAI_SEARCH_CHAR_MAP: Record<string, string> = {
    "เเ": "แ",
  };

  function normalizeThaiSearchText(text: string) {
    let normalizedText = text.normalize("NFC");

    for (const [from, to] of Object.entries(THAI_SEARCH_CHAR_MAP)) {
      normalizedText = normalizedText.replaceAll(from, to);
    }

    return normalizedText.toLowerCase();
  }

  async function fetchData() {
    const filter = normalizeThaiSearchText(search);
    const data = await getNoteItems({
      name: filter,
      parentId: currentFolderId[currentFolderId.length - 1]?.id || null,
    });
    console.log(currentFolderId.length);

    setNoteItems(Array.isArray(data) ? data : []);
  }

  // Fetch data on search change
  useEffect(() => {
    fetchData();
  }, [search, currentFolderId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (newDropdownRef.current && !newDropdownRef.current.contains(event.target as Node)) {
        setCreateNote(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function addNote(type: string) {
    await addNoteItem("New Note", type, currentFolderId[currentFolderId.length - 1]?.id , "Folder0001");
    await fetchData();
  }

  function truncateBreadcrumb(
      currentPath: NoteFilterValue[], 
      clickedIndex: number
  ) {
      const update = currentPath.slice(0, clickedIndex + 1);
      setCurrentFolderId(update);
  }

  function handleEdit(item: NoteFilterValue){
    setIsEditing(!isEditing);
    setEditing(item);
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm("Delete this note/folder?");
    if (!confirmDelete) return;
    try {
      await deleteNoteItem(id);
      await fetchData();
    } catch (err) {
      console.error("Error deleting note item:", err);
    }
  }

  return (
    <div className="">
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-white text-[32px] font-bold">Notes</div>
          
          {/* search bar and new dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#343639] w-[500px] p-[8px] rounded-4xl shadow-[2px_3px_5px_rgba(255,255,255,0.3)]">
              <input
                className="w-full text-gray-300 text-[18px] px-1 rounded-2xl outline-none bg-transparent"
                type="text"
                value={search}
                placeholder="Type to search..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="mx-2 pt-[2px] material-symbols-outlined text-(--font)">
                search
              </span>
            </div>

            <div className="relative" ref={newDropdownRef}>
              <button
                onClick={() => setCreateNote(!createNote)}
                className="flex items-center text-(--font) text-[18px] px-4 py-2 rounded-2xl hover:text-(--font) bg-(--color4) hover:bg-(--color4)/60 leading-none cursor-pointer"
              >
                + New |
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  strokeWidth="0.6"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 pl-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {createNote && (
                <CreateNote
                  onSelect={(type) => {
                    addNote(type);
                    setCreateNote(false);
                  }}
                  onClose={() => setCreateNote(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-b-2 border-white mt-4"></div>
        
        {/* slug */}
        <div className="flex m-2">
          <div onClick={() => setCurrentFolderId([])} className="text-[#6E6E6E] hover:text-[#989898]">Home </div>
          {currentFolderId.map((item, index) =>{
            return(
              <div key={index}  className="flex " >
                <div className="mx-1 text-[#6E6E6E]">&gt;</div>
                <button onClick={() => truncateBreadcrumb(currentFolderId, index)} className="text-[#6E6E6E] hover:text-[#989898]">{item.name} </button>
              </div>
            );
          })}
        </div>

        <table className="w-full mt-2 border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-[18px] text-white font-bold py-4 pl-4  min-w-[300px] max-w-[300px] ">
                Name
              </th>
              <th className="text-left text-[18px] text-white font-bold py-4 pl-4  min-w-[240px] max-w-[240px] ">
                Type
              </th>
              <th className="text-left text-[18px] text-white font-bold py-4 pl-4   min-w-[240px] max-w-[240px] ">
                Date
              </th>
              <th className="text-left text-[18px] text-white font-bold py-4 pl-4  min-w-[140px] max-w-[140px] "></th>
              <th className="text-left text-[18px] text-white font-bold py-4 pl-4  min-w-[200px] max-w-[200px] "></th>
            </tr>
          </thead>

          <tbody>
            {noteItems.map((item) => {
              return <NoteItem key={item.id} item={item} setCurrentFolder={setCurrentFolderId} currentFolder={currentFolderId} handleEdit={handleEdit} handleDelete={handleDelete} />;
            })}
          </tbody>
        </table>
      </div>


      {isEditing && editing !== null && (
        <div className="absolute bg-black/60 w-[100vw] h-[100vh] left-0 top-0 m-0 z-40">
          <EditNoteItem onClose={() => setIsEditing(false)} item={editing} onUpdated={fetchData} />
        </div>
      )}
    </div>
  );
}