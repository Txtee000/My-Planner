"use client";

import { useState, useMemo, useEffect } from "react";

type TrashItemType = "task" | "timeline" | "note";

interface TrashItem {
  id: string;
  type: TrashItemType;
  title: string;
  description?: string;
  category?: {
    title: string;
    colorHex: string;
    group?: string;
  };
  deletedAt: string; // ISO date string
  details?: {
    status?: "not_started" | "in_progress" | "done";
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    content?: string; // for notes
  };
}

const initialTrashItems: TrashItem[] = [
  {
    id: "1",
    type: "task",
    title: "Read Next.js 16 Documentation",
    description: "Read the relevant guide in node_modules/next/dist/docs/ before writing any code to understand breaking changes.",
    category: {
      title: "Study",
      colorHex: "#8b5cf6",
      group: "study",
    },
    deletedAt: "2026-06-29T10:30:00.000Z",
    details: {
      status: "in_progress",
      startDate: "2026-06-29",
      isAllDay: true,
    } as any,
  },
  {
    id: "2",
    type: "task",
    title: "Review database index options",
    description: "Check if indexes on task_item_categories are functioning correctly.",
    category: {
      title: "Work",
      colorHex: "#3b82f6",
      group: "work",
    },
    deletedAt: "2026-06-27T14:20:00.000Z",
    details: {
      status: "done",
      startDate: "2026-06-27",
      isAllDay: true,
    } as any,
  },
  {
    id: "3",
    type: "timeline",
    title: "Weekly Sync Meeting",
    description: "Discuss planner project milestones and Supabase integration status.",
    category: {
      title: "Work",
      colorHex: "#3b82f6",
      group: "work",
    },
    deletedAt: "2026-06-30T09:15:00.000Z",
    details: {
      startDate: "2026-06-30",
      endDate: "2026-06-30",
      startTime: "10:00",
      endTime: "11:00",
    },
  },
  {
    id: "4",
    type: "timeline",
    title: "Prepare Presentation Draft",
    description: "Prepare slides for the project overview and database architecture.",
    category: {
      title: "Study",
      colorHex: "#8b5cf6",
      group: "study",
    },
    deletedAt: "2026-06-28T08:00:00.000Z",
    details: {
      startDate: "2026-06-28",
      endDate: "2026-06-28",
      startTime: "14:00",
      endTime: "16:30",
    },
  },
  {
    id: "5",
    type: "note",
    title: "Idea for Pomodoro Integration",
    description: "Integrate Pomodoro timer with task categories. Study session = 25m focus + 5m break.",
    deletedAt: "2026-06-25T11:45:00.000Z",
    details: {
      content: "We can track completed Pomodoro cycles on task_items table by adding an integer column `pomodoros_completed`.",
    },
  },
];

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export function TrashList() {
  const [items, setItems] = useState<TrashItem[]>(initialTrashItems);
  const [activeTab, setActiveTab] = useState<"all" | TrashItemType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"empty" | "delete_single">("empty");
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  // Auto remove toast
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchQuery]);

  // Count items for badges
  const counts = useMemo(() => {
    return {
      all: items.length,
      task: items.filter((i) => i.type === "task").length,
      timeline: items.filter((i) => i.type === "timeline").length,
      note: items.filter((i) => i.type === "note").length,
    };
  }, [items]);

  // Action Handlers
  const handleRestore = (id: string, title: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    addToast(`"${title}" has been successfully restored!`, "success");
  };

  const handleRestoreAll = () => {
    if (items.length === 0) {
      addToast("Trash is already empty!", "info");
      return;
    }
    const restoredCount = items.length;
    setItems([]);
    addToast(`Restored all ${restoredCount} items!`, "success");
  };

  const triggerDeleteConfirm = (id: string) => {
    setTargetItemId(id);
    setModalAction("delete_single");
    setIsModalOpen(true);
  };

  const triggerEmptyConfirm = () => {
    if (items.length === 0) {
      addToast("Trash is already empty!", "info");
      return;
    }
    setModalAction("empty");
    setIsModalOpen(true);
  };

  const executeDelete = () => {
    if (modalAction === "delete_single" && targetItemId) {
      const targetItem = items.find((i) => i.id === targetItemId);
      setItems((prev) => prev.filter((item) => item.id !== targetItemId));
      addToast(`"${targetItem?.title || "Item"}" deleted permanently.`, "error");
    } else if (modalAction === "empty") {
      setItems([]);
      addToast("Trash has been permanently emptied.", "error");
    }
    setIsModalOpen(false);
    setTargetItemId(null);
  };

  // Helper to format date / relative time
  const getRelativeTimeString = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) return "Deleted today";
    if (diffDays === 2) return "Deleted yesterday";
    return `Deleted ${diffDays} days ago`;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case "done":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">Done</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">Not Started</span>;
    }
  };

  return (
    <div className="w-[1180px] text-(--font) flex flex-col gap-6 relative">
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

      {/* Header Section */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-white text-[32px] font-bold leading-none">Trash Bin</h1>
          <p className="text-(--color5) text-sm mt-2">
            Items in the trash will be permanently deleted after 30 days. Restored items will return to their original locations.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRestoreAll}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-[#353B45]/50 text-white font-medium hover:bg-[#353B45] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="material-symbols-outlined !text-[20px]">restore_page</span>
            Restore All
          </button>
          <button
            onClick={triggerEmptyConfirm}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D94545] hover:bg-[#D94545]/80 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-red-900/20"
          >
            <span className="material-symbols-outlined !text-[20px]">delete_forever</span>
            Empty Trash
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-b border-white/10"></div>

      {/* Controls: Search and Tabs */}
      <div className="flex justify-between items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-[#353B45]/60 p-1 rounded-2xl border border-white/5">
          {(["all", "task", "timeline", "note"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1) + "s";
            const cleanLabel = tab === "all" ? "All Items" : label;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? "bg-(--color4) text-white shadow-sm"
                    : "text-(--font)/60 hover:text-(--font)"
                }`}
              >
                <span>{cleanLabel}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-white/25 text-white" : "bg-[#222831]/60 text-(--font)/50"
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex bg-[#343639]/90 w-[400px] p-[8px] rounded-3xl border border-white/10 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]">
          <input
            className="w-full text-gray-300 text-[16px] pl-2 bg-transparent outline-none placeholder-gray-500"
            type="text"
            value={searchQuery}
            placeholder="Search deleted items..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="mx-2 material-symbols-outlined text-(--font)/50">search</span>
        </div>
      </div>

      {/* Main Items Display */}
      {filteredItems.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-[#353B45]/20 rounded-3xl border border-white/5 backdrop-blur-sm">
          <span className="material-symbols-outlined !text-[72px] text-(--color5)/50 mb-4 animate-pulse">
            delete_outline
          </span>
          <h3 className="text-xl font-bold text-white/80">No Items Found</h3>
          <p className="text-(--color5) mt-2 text-sm max-w-[320px] text-center">
            {searchQuery
              ? "We couldn't find any items matching your search criteria."
              : "Your trash bin is empty! Deleted tasks, timelines, and notes will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between p-5 bg-[#353B45]/45 hover:bg-[#353B45]/70 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Type Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  item.type === "task"
                    ? "bg-purple-500"
                    : item.type === "timeline"
                    ? "bg-blue-500"
                    : "bg-teal-500"
                }`}
              />

              {/* Card Content */}
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 pl-1.5">
                    {/* Item type badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase ${
                        item.type === "task"
                          ? "bg-purple-500/15 text-purple-400"
                          : item.type === "timeline"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-teal-500/15 text-teal-400"
                      }`}
                    >
                      {item.type}
                    </span>

                    {/* Category if available */}
                    {item.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-md font-semibold text-white/90"
                        style={{ backgroundColor: `${item.category.colorHex}25`, border: `1px solid ${item.category.colorHex}30`, color: item.category.colorHex }}
                      >
                        {item.category.title}
                      </span>
                    )}

                    {/* Task status */}
                    {item.type === "task" && getStatusBadge(item.details?.status)}
                  </div>

                  {/* Relative deletion date */}
                  <span className="text-xs text-(--color5) font-medium">
                    {getRelativeTimeString(item.deletedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-(--color4) transition-colors duration-200 pl-1.5 line-clamp-1">
                  {item.title}
                </h3>

                {/* Description / Content */}
                <p className="text-sm text-(--font)/70 mt-2 pl-1.5 line-clamp-2 leading-relaxed">
                  {item.description || item.details?.content || "No description provided."}
                </p>

                {/* Event specific details: Time/Dates */}
                {item.type === "timeline" && item.details && (
                  <div className="mt-3 pl-1.5 flex items-center gap-2 text-xs text-(--font)/50 font-medium">
                    <span className="material-symbols-outlined !text-[14px]">calendar_today</span>
                    <span>
                      {item.details.startDate}
                      {item.details.endDate && item.details.endDate !== item.details.startDate && ` - ${item.details.endDate}`}
                    </span>
                    {item.details.startTime && (
                      <>
                        <span className="w-1 h-1 bg-(--font)/30 rounded-full"></span>
                        <span className="material-symbols-outlined !text-[14px]">schedule</span>
                        <span>{item.details.startTime} - {item.details.endTime}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 pl-1.5">
                <span className="text-xs text-(--color5) flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[14px]">timer</span>
                  Permanent deletion in 20+ days
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(item.id, item.title)}
                    className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-(--color4)/20 hover:text-(--color4) text-white/70 transition-all duration-200"
                    title="Restore item"
                  >
                    <span className="material-symbols-outlined !text-[20px]">restore</span>
                  </button>
                  <button
                    onClick={() => triggerDeleteConfirm(item.id)}
                    className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-red-500/25 hover:text-red-400 text-white/70 transition-all duration-200"
                    title="Delete permanently"
                  >
                    <span className="material-symbols-outlined !text-[20px]">delete_forever</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c20]/80 backdrop-blur-sm transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#2d323b] border border-white/10 rounded-3xl p-6 shadow-2xl transform scale-100 transition-all animate-modal-scale">
            {/* Warning Icon & Title */}
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <span className="material-symbols-outlined !text-[32px] p-2 bg-red-500/10 rounded-2xl">
                warning
              </span>
              <h2 className="text-xl font-bold text-white">
                {modalAction === "empty" ? "Empty Trash Bin?" : "Delete Permanently?"}
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-(--font)/80 leading-relaxed mb-6">
              {modalAction === "empty"
                ? "Are you sure you want to permanently delete all items in the trash? This action is irreversible, and you will not be able to recover these items."
                : "Are you sure you want to permanently delete this item? This action cannot be undone."}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-[#D94545] hover:bg-[#D94545]/80 text-white text-sm font-semibold shadow-md shadow-red-900/15 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles for animations (added in Tailwind or styles tag) */}
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
