"use client";

import { useEffect, useState } from "react";
import { getTaskCategories } from "@/services/taskCategoryService";
import { 
  getFilterTask, 
  addFilterTask, 
  updateFilterTask, 
  deleteFilterTask 
} from "@/services/filterService";

interface CustomFilter {
  id: string;
  name: string;
  statuses: TaskStatus[];      // 'not_started', 'in_progress', 'done'
  task_type: "all" | TaskCategoryType; // 'all', 'task', 'activity'
  task_group: "all" | TaskGroup;      // 'all', 'study', 'work'
  data_scope: "all" | "today" | "tomorrow" | "this_week" | "overdue";
  is_all_day: "all" | "all_day_only" | "timed_only";
  category_ids?: string[];      // Array of Category IDs
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export function Setting_filter() {
  const [filters, setFilters] = useState<CustomFilter[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<CustomFilter | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formStatuses, setFormStatuses] = useState<TaskStatus[]>([]);
  const [formTaskType, setFormTaskType] = useState<"all" | TaskCategoryType>("all");
  const [formTaskGroup, setFormTaskGroup] = useState<"all" | TaskGroup>("all");
  const [formDateScope, setFormDateScope] = useState<CustomFilter["data_scope"]>("all");
  const [formIsAllDay, setFormIsAllDay] = useState<CustomFilter["is_all_day"]>("all");
  const [formCategoryIds, setFormCategoryIds] = useState<string[]>([]);

  const fetchFilters = async () => {
    try {
      const data = await getFilterTask();
      setFilters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching filters:", error);
      addToast("Failed to load filters from database", "error");
    }
  };

  // Load filters and categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getTaskCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching task categories:", error);
      }
    }
    fetchCategories();
    fetchFilters();
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Open Modal for Create or Edit
  const openModal = (filter: CustomFilter | null = null) => {
    if (filter) {
      setEditingFilter(filter);
      setFormName(filter.name);
      setFormStatuses(filter.statuses);
      setFormTaskType(filter.task_type);
      setFormTaskGroup(filter.task_group);
      setFormDateScope(filter.data_scope);
      setFormIsAllDay(filter.is_all_day);
      setFormCategoryIds(filter.category_ids || []);
    } else {
      setEditingFilter(null);
      setFormName("");
      setFormStatuses(["not_started", "in_progress"]);
      setFormTaskType("all");
      setFormTaskGroup("all");
      setFormDateScope("all");
      setFormIsAllDay("all");
      setFormCategoryIds([]);
    }
    setIsModalOpen(true);
  };

  // Save Filter
  const handleSaveFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast("Please enter a filter name.", "error");
      return;
    }
    if (formStatuses.length === 0) {
      addToast("Please select at least one status.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFilter) {
        // Edit in DB
        await updateFilterTask({
          id: editingFilter.id,
          name: formName.trim(),
          task_type: formTaskType,
          task_group: formTaskType === "activity" ? "all" : formTaskGroup,
          statuses: formStatuses,
          dataScope: formDateScope,
          isAllDay: formIsAllDay,
          category_ids: formCategoryIds,
        });
        addToast(`Filter "${formName}" updated successfully!`, "success");
      } else {
        // Create in DB
        await addFilterTask({
          name: formName.trim(),
          task_type: formTaskType,
          task_group: formTaskType === "activity" ? "all" : formTaskGroup,
          statuses: formStatuses,
          dataScope: formDateScope,
          isAllDay: formIsAllDay,
          category_ids: formCategoryIds,
        });
        addToast(`Filter "${formName}" created successfully!`, "success");
      }
      setIsModalOpen(false);
      await fetchFilters(); // reload from DB
    } catch (error: any) {
      console.error("Error saving filter:", error);
      addToast(error.message || "Failed to save filter", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Filter
  const handleDeleteFilter = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete filter "${name}"?`);
    if (!confirmDelete) return;

    try {
      await deleteFilterTask(id);
      addToast(`Filter "${name}" deleted.`, "success");
      await fetchFilters(); // reload from DB
    } catch (error: any) {
      console.error("Error deleting filter:", error);
      addToast(error.message || "Failed to delete filter", "error");
    }
  };

  // Checkbox handlers
  const toggleStatus = (status: TaskStatus) => {
    setFormStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleCategory = (catId: string) => {
    setFormCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Helpers to render criteria badges
  const getDateScopeLabel = (scope: CustomFilter["data_scope"]) => {
    switch (scope) {
      case "today":
        return "Today";
      case "tomorrow":
        return "Tomorrow";
      case "this_week":
        return "This Week";
      case "overdue":
        return "Overdue";
      default:
        return "All time";
    }
  };

  const getIsAllDayLabel = (mode: CustomFilter["is_all_day"]) => {
    switch (mode) {
      case "all_day_only":
        return "All-day only";
      case "timed_only":
        return "Timed only";
      default:
        return "All times";
    }
  };

  return (
    <div className="m-4 max-w-[1448px] text-[var(--font)] flex flex-col gap-6 mt-8">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 min-w-[280px] pointer-events-auto transform translate-y-0 transition-all duration-300 ease-out animate-slide-in ${
              toast.type === "success"
                ? "bg-[#1f2937]/90 border-green-500/30 text-green-400"
                : toast.type === "error"
                ? "bg-[#1f2937]/90 border-red-500/30 text-red-400"
                : "bg-[#1f2937]/90 border-(--color4)/30 text-(--color4)"
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            <div className="text-sm font-medium">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold">Custom Task Filters</h2>
          <p className="text-(--color5) text-xs mt-1">
            Create custom filter views to query and display tasks based on specific rules and criteria.
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="flex items-center ml-4 gap-1.5 px-4 py-2 bg-(--color4) hover:bg-(--color4)/80 rounded-xl text-sm font-bold text-(--font) transition cursor-pointer shadow-md shadow-teal-900/10"
        >
          <span className="material-symbols-outlined !text-[18px]">add</span>
          Create Filter
        </button>
      </div>

      {/* Grid of Saved Filters */}
      {filters.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-[var(--color3)]/25 p-12 text-center text-[15px] text-[var(--color3)] bg-[#353B45]/10">
          <span className="material-symbols-outlined !text-[48px] text-[var(--color3)]/40 mb-3">filter_alt_off</span>
          <div>No custom filters found. Click "Create Filter" to make your first one!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="group relative flex flex-col justify-between p-5 bg-[#353B45]/45 hover:bg-[#353B45]/70 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                {/* Header: name & actions */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-md font-bold text-white group-hover:text-(--color4) transition-colors duration-200 truncate">
                    {filter.name}
                  </h3>
                  <div className="flex gap-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openModal(filter)}
                      className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                      title="Edit Filter"
                    >
                      <span className="material-symbols-outlined !text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id, filter.name)}
                      className="p-1 hover:bg-red-500/15 rounded-lg text-red-400 hover:text-red-300 transition cursor-pointer"
                      title="Delete Filter"
                    >
                      <span className="material-symbols-outlined !text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Criteria display */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {/* Statuses */}
                  {filter.statuses && filter.statuses.map((status) => (
                    <span
                      key={status}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        status === "done"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : status === "in_progress"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                      }`}
                    >
                      {status === "done" ? "Done" : status === "in_progress" ? "In Progress" : "Not Started"}
                    </span>
                  ))}

                  {/* Task Type */}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-500/15 border border-blue-500/20 text-blue-400">
                    Type: {filter.task_type === "all" ? "All" : filter.task_type}
                  </span>

                  {/* Task Group */}
                  {filter.task_type !== "activity" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      Group: {filter.task_group === "all" ? "All" : filter.task_group}
                    </span>
                  )}

                  {/* Date Scope */}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center gap-1">
                    <span className="material-symbols-outlined !text-[12px] leading-none">calendar_today</span>
                    {getDateScopeLabel(filter.data_scope)}
                  </span>

                  {/* All Day Mode */}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-500/15 border border-gray-500/25 text-gray-400">
                    {getIsAllDayLabel(filter.is_all_day)}
                  </span>
                </div>

                {/* Subcategories (Matched) */}
                {filter.category_ids && filter.category_ids.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="text-[11px] text-(--color5) font-bold mb-1.5">Categories:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.filter((c) => filter.category_ids?.includes(c.id)).map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] px-2 py-0.5 rounded-md font-semibold text-white/90 flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${c.color_hex}15`,
                            border: `1px solid ${c.color_hex}30`,
                            color: c.color_hex,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color_hex }} />
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation / Editing Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c20]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#2d323b] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-modal-scale">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingFilter ? "Edit Custom Filter" : "Create Custom Filter"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFilter} className="flex flex-col gap-4 text-sm">
              {/* Filter Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[var(--color3)]">Filter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. taskToday, workInProgress"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-4 text-white outline-none transition focus:border-[var(--color4)]"
                />
              </div>

              {/* Status checkboxes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[var(--color3)]">Statuses</label>
                <div className="flex flex-wrap gap-4 bg-[var(--color1)] p-3 rounded-xl border border-[var(--color3)]/10">
                  {(["not_started", "in_progress", "done"] as TaskStatus[]).map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formStatuses.includes(status)}
                        onChange={() => toggleStatus(status)}
                        className="w-4 h-4 rounded accent-(--color4) cursor-pointer"
                      />
                      <span className="capitalize">{status.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Task Type selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[var(--color3)]">Task Type</label>
                <select
                  value={formTaskType}
                  onChange={(e) => setFormTaskType(e.target.value as any)}
                  className="h-11 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-3 text-white outline-none cursor-pointer"
                >
                  <option value="all">All Types (Task & Activity)</option>
                  <option value="task">Task only</option>
                  <option value="activity">Activity only</option>
                </select>
              </div>

              {/* Task Group (Shown if Type is not activity) */}
              {formTaskType !== "activity" && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[var(--color3)]">Task Group</label>
                  <select
                    value={formTaskGroup}
                    onChange={(e) => setFormTaskGroup(e.target.value as any)}
                    className="h-11 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-3 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Groups (Study & Work)</option>
                    <option value="study">Study</option>
                    <option value="work">Work</option>
                  </select>
                </div>
              )}

              {/* Date Scope & All Day */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[var(--color3)]">Due Date Range</label>
                  <select
                    value={formDateScope}
                    onChange={(e) => setFormDateScope(e.target.value as any)}
                    className="h-11 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-3 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Due Today</option>
                    <option value="tomorrow">Due Tomorrow</option>
                    <option value="this_week">Due This Week</option>
                    <option value="overdue">Overdue only</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[var(--color3)]">Time Type</label>
                  <select
                    value={formIsAllDay}
                    onChange={(e) => setFormIsAllDay(e.target.value as any)}
                    className="h-11 w-full rounded-xl border border-[var(--color3)]/20 bg-[var(--color1)] px-3 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All (All-day & Timed)</option>
                    <option value="all_day_only">All-day events only</option>
                    <option value="timed_only">Timed events only</option>
                  </select>
                </div>
              </div>

              {/* Multi-select Categories */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[var(--color3)]">Limit to Categories</label>
                <div className="max-h-[140px] overflow-y-auto bg-[var(--color1)] p-3 rounded-xl border border-[var(--color3)]/10 flex flex-col gap-2">
                  {categories.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-2">No categories defined in settings yet.</div>
                  ) : (
                    categories.map((cat) => {
                      const isChecked = formCategoryIds.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 cursor-pointer select-none text-xs hover:text-[var(--color4)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.id)}
                            className="w-4.5 h-4.5 rounded accent-(--color4) cursor-pointer"
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color_hex }}
                          />
                          <span className="font-semibold text-white/90">{cat.title}</span>
                          <span className="text-[10px] text-gray-500 capitalize">
                            ({cat.task_type} {cat.task_group ? `• ${cat.task_group}` : ""})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim() || formStatuses.length === 0 || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-(--color4) hover:bg-(--color4)/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-teal-900/10 transition cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Filter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateY(-1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes modal-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-scale {
          animation: modal-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}