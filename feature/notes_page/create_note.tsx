"use client";

interface CreateNoteProps {
  onSelect: (type: "file" | "folder") => void;
  onClose: () => void;
}

export function CreateNote({ onSelect, onClose }: CreateNoteProps) {
  return (
    <div className="absolute right-[0px] top-[48px] z-30 w-[160px] rounded-2xl border border-white/10 bg-[#2d323b]/95 backdrop-blur-md p-1.5 shadow-xl shadow-black/40 animate-modal-scale flex flex-col gap-0.5">
      <button
        onClick={() => onSelect("file")}
        className="w-full px-3 py-2 text-left text-xs font-semibold text-white/90 hover:text-[var(--color4)] hover:bg-white/[0.05] rounded-xl flex items-center gap-2.5 transition duration-200 cursor-pointer"
      >
        <span className="material-symbols-outlined !text-[18px] text-white/50">description</span>
        <span className="text-[16px]">New File</span>
      </button>
      <button
        onClick={() => onSelect("folder")}
        className="w-full px-3 py-2 text-left text-xs font-semibold text-white/90 hover:text-[var(--color4)] hover:bg-white/[0.05] rounded-xl flex items-center gap-2.5 transition duration-200 cursor-pointer"
      >
        <span className="material-symbols-outlined !text-[18px] text-white/50">folder</span>
        <span className="text-[16px]">New Folder</span>
      </button>
    </div>
  );
}