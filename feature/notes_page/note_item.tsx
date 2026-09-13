"use client"

import { deleteNoteItem, getNoteItems, updateNoteItem } from "@/services/noteService";
import React, { useEffect, useState } from "react"
import {NoteFilterValue, NoteItemProps} from "@/types/note"



export function NoteItem({ item, setCurrentFolder, currentFolder, handleEdit, handleDelete }: NoteItemProps){
    const [favorite, setFavorite] = useState(item.isFavorite)


    const now = new Date();
    const date = new Date(item.updated_at);

    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString(); // Months are zero-based
    const year = date.getFullYear().toString();
    const formattedDate = `${day}/${month}/${year}`;

    const [name, setName] = useState(item.name);




    if(date == new Date(item.updated_at)){
        console.log("date is equal");

    }

    async function handleFavorite(e: React.MouseEvent){

        e.stopPropagation();
        
        const newFavorite = !favorite
        setFavorite(newFavorite);

        await updateNoteItem({
            id: item.id,
            is_favorite: newFavorite,
        })
    }
   function handleSlug(){
        if(item.type == "file"){
            return;
        }
        const updatedFolders = [...currentFolder, item];
        setCurrentFolder(updatedFolders);
   }

   
   
   

    return (
              
        <tr key={item.id} className="relative group border-b-2 border-(--color2) cursor-pointer shadow
            transition-all duration-200 ease-in-out "
            onClick={() => handleSlug()}
        >
            
            <td className="relative py-6 mr-4 pl-4 min-w-[300px] max-w-[300px]">
                <div className="flex items-center text-[16px] text-(--font) break-all leading-none">
                    {item.type === "folder" && (
                    <div>
                        <span className="material-symbols-outlined text-[16px] mr-2 ">folder</span>
                    </div>
                    )}
                    {item.type === "file" && (
                    <div>
                        <span className="material-symbols-outlined text-[16px] mr-2 ">description</span>
                    </div>
                    )}
                    <div>
                        <div>{item.name}</div>
                    </div>
                </div>

                {/* edit */}
                <button 
                    className="absolute top-0 left-0 opacity-0 h-full w-[180px] group-hover:opacity-100 group-hover:translate-x-0 -translate-x-5 duration-400 ease-out transition-all bg-[#1e3a5f] hover:bg-[#254673] rounded-r-2xl text-blue-400 hover:text-blue-300 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation(); // กันทะลุ
                        handleEdit(item);
                    }}
                >
                    <span className="material-symbols-outlined text-[24px]">edit</span>
                </button>
            </td>
            <td className="text-[16px] text-white font-normal py-4 pl-4 mr-4 min-w-[240px] max-w-[240px] ">{item.type}</td>
            <td className="text-[16px] text-white font-normal py-4 pl-4 mr-4 min-w-[240px] max-w-[240px]">{formattedDate}</td>
            <td className="text-[16px] text-white font-normal py-4  pl-4 mr-4 min-w-[140px] max-w-[140px]">
                <button 
                    className="text-white font-bold py-1 px-2 rounded"
                    onClick={handleFavorite}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className={`size-6 text-yellow-500 ${favorite ? "fill-current" : "fill-none"} hover:fill-current`}
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" 
                        />
                    </svg>

                </button>
                
            </td>
            <td className="absolute h-[77px] right-0">
                {/* delete */}
                <button 
                    className=" opacity-0 h-full w-[180px] group-hover:opacity-100 group-hover:translate-x-0  translate-x-5 duration-400 ease-out transition-all bg-[#522626] hover:bg-[#592929] rounded-l-2xl text-red-500 hover:text-red-400"
                    onClick={(e) => {
                        e.stopPropagation(); // อย่าลืมใส่ กันทะลุไปโดนคลิกแถว!
                        handleDelete(item.id);
                    }}
                >
                        <span className="material-symbols-outlined text-[24px]">Delete</span>
                </button>
            </td>
        </tr>
    );
}