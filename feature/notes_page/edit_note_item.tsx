"use client";

import React, { useEffect, useState } from "react";
import { NoteFilterValue } from "@/types/note";
import { updateNoteItem } from "@/services/noteService";
import { getFilterTask } from "@/services/filterService";
import { getTaskCategories } from "@/services/taskCategoryService";

type EditNoteItemProps = {
  item: NoteFilterValue;
  onClose: () => void;
  onUpdated: () => void;
};

export function EditNoteItem({ onClose, item, onUpdated }: EditNoteItemProps) {
  const [name, setName] = useState(item.name);
  
  // Filter modes state (folders only)
  // "custom_filter" or "categories"
  const [mode, setMode] = useState<"custom_filter" | "categories">(
    item.type === "folder" && item.custom_filter_id ? "custom_filter" : "categories"
  );

  // Custom filters state
  const [customFilters, setCustomFilters] = useState<any[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(item.custom_filter_id || null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(item.category_ids || []);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch custom filters (folders only)
  useEffect(() => {
    if (item.type === "folder") {
      const fetchFilters = async () => {
        try {
          setIsLoadingFilters(true);
          const filters = await getFilterTask();
          setCustomFilters(Array.isArray(filters) ? filters : []);
        } catch (err: any) {
          console.error("Error fetching custom filters:", err);
        } finally {
          setIsLoadingFilters(false);
        }
      };
      fetchFilters();
    }
  }, [item.type]);

  // Fetch categories (all items)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await getTaskCategories();
        

        setCategories(data);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      setErrorMsg("");


      const categoryIdsParam = item.type === "file" || mode === "categories" 
        ? selectedCategoryIds 
        : []; // Clear categories if using a custom filter

      await updateNoteItem({
        id: item.id,
        name: name.trim(),
        category_ids: categoryIdsParam,
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating note item:", err);
      setErrorMsg(err.message || "Failed to update item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#2d323b] border border-white/10 rounded-3xl p-6 shadow-2xl animate-modal-scale text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <h3 className="text-[18px] font-bold text-white">
            {item.type === "folder" ? "Edit Folder" : "Edit File"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition cursor-pointer"
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-gray-400">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${item.type} name...`}
              className="h-10 w-full rounded-xl border border-white/10 bg-[#1e222b] px-4 text-white outline-none focus:border-[var(--color4)] transition text-sm font-medium"
            />
          </div>

          {/* Classification Switcher (Folders Only) */}
          {item.type === "folder" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-400">Classification Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-[#1e222b] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setMode("categories")}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer text-center ${
                    mode === "categories"
                      ? "bg-[var(--color4)] text-[var(--color2)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Category Tags
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom_filter")}
                  className={`py-2 rounded-lg font-bold transition cursor-pointer text-center ${
                    mode === "custom_filter"
                      ? "bg-[var(--color4)] text-[var(--color2)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Custom Filter
                </button>
              </div>
            </div>
          )}

          {/* Custom Task Filter Content */}
          {item.type === "folder" && mode === "custom_filter" && (
            <div className="flex flex-col gap-1.5 animate-modal-scale">
              <label className="font-bold text-gray-400">Custom Task Filter</label>
              {isLoadingFilters ? (
                <div className="text-white/40 italic py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined animate-spin !text-[14px]">sync</span>
                  Loading filters...
                </div>
              ) : (
                <select
                  value={selectedFilterId || ""}
                  onChange={(e) => setSelectedFilterId(e.target.value || null)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#1e222b] px-4 text-white outline-none focus:border-[var(--color4)] transition text-sm cursor-pointer"
                >
                  <option value="">-- No Filter (Default) --</option>
                  {customFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[10px] text-gray-500 mt-0.5">
                Link this folder to a preset custom filter to apply preconfigured filters.
              </p>
            </div>
          )}

          {/* Category Tags Content (Files OR Folders in categories mode) */}
          {(item.type === "file" || (item.type === "folder" && mode === "categories")) && (
            <div className="flex flex-col gap-1.5 animate-modal-scale">
              <label className="font-bold text-gray-400">Category Tags</label>
              {isLoadingCategories ? (
                <div className="text-white/40 italic py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined animate-spin !text-[14px]">sync</span>
                  Loading categories...
                </div>
              ) : (
                <div className="max-h-[140px] overflow-y-auto bg-[#1e222b] p-3 rounded-xl border border-white/10 flex flex-col gap-2">
                  {categories.map((cat) => {
                    const isChecked = selectedCategoryIds.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCategory(cat.id)}
                          className="w-4 h-4 rounded accent-[var(--color4)] cursor-pointer"
                        />
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color_hex || "#333" }} />
                        <span className="font-semibold text-white/90">{cat.title}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-[10px] text-gray-500 mt-0.5">
                Select one or more tag categories for this {item.type}.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white font-semibold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-5 py-2 rounded-xl bg-[var(--color4)] hover:bg-[var(--color4)]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color2)] font-bold shadow-md transition cursor-pointer text-xs"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}