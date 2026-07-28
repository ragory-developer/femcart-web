"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import { Check, Pencil, Tag as TagIcon, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import SearchableSelect from "../SearchableSelect";
import { ProductFormData } from "./ProductTab";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface TagTabProps {
  formData: ProductFormData;
  onChange: (data: ProductFormData) => void;
}

const API = `${API_URL}/api/tags`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function TagTab({ formData, onChange }: TagTabProps) {
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);

  // Management State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingGlobal, setSavingGlobal] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) setAvailableTags(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // --- Product Tag Assignment Logic ---
  const tagOptions = availableTags.map((t) => ({ value: t.id, label: t.name }));

  const handleCreateTag = async (inputValue: string) => {
    setCreatingTag(true);
    try {
      const newTagNames = inputValue
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const createdTags: TagItem[] = [];
      const newTagIds: string[] = [];

      for (const tName of newTagNames) {
        const existing = availableTags.find(
          (t) => t.name.toLowerCase() === tName.toLowerCase(),
        );
        if (existing) {
          if (!formData.tags?.includes(existing.id)) {
            newTagIds.push(existing.id);
          }
        } else {
          const res = await fetch(API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ name: tName }),
          });
          const json = await res.json();
          if (json.success) {
            createdTags.push(json.data);
            newTagIds.push(json.data.id);
          }
        }
      }

      if (createdTags.length > 0) {
        setAvailableTags((prev) => [...prev, ...createdTags]);
      }
      if (newTagIds.length > 0 || createdTags.length > 0) {
        onChange({
          ...formData,
          tags: Array.from(new Set([...(formData.tags || []), ...newTagIds])),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingTag(false);
    }
  };

  // --- Global Management Logic ---
  const handleDeleteGlobal = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this tag globally? It will be removed from all products!",
      )
    )
      return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        fetchTags();
        onChange({
          ...formData,
          tags: (formData.tags || []).filter((tId) => tId !== id),
        });
      } else {
        showToast.error("Failed to delete tag");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  const startEdit = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const handleUpdateGlobal = async (id: string) => {
    setSavingGlobal(true);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchTags();
      } else {
        showToast.error("Failed to update");
      }
    } catch {
      showToast.error("Network error");
    } finally {
      setSavingGlobal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: ADD TO PRODUCT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Product Tags
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Search existing tags or type new ones. Use commas to add multiple tags
          at once.
        </p>

        <div className="max-w-2xl">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Select or Create Tags
          </label>
          <SearchableSelect
            options={tagOptions}
            value={formData.tags || []}
            onChange={(val) => onChange({ ...formData, tags: val })}
            placeholder="Search tags or type a new one..."
            className="text-gray-900 dark:text-white"
            isMulti
            creatable
            onCreateOption={handleCreateTag}
            isLoading={creatingTag}
          />
        </div>
      </div>

      {/* SECTION 2: GLOBAL MANAGEMENT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Global Tag Management
          </h3>
          <p className="text-sm text-gray-500">
            Edit or permanently delete tags from the database.
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {availableTags.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No tags found in the system.
            </div>
          ) : (
            availableTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <TagIcon size={14} className="text-emerald-500" />
                  </div>
                  {editingId === tag.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateGlobal(tag.id)}
                        disabled={savingGlobal}
                        className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {tag.name}
                      </p>
                      <p className="text-xs text-gray-400">/{tag.slug}</p>
                    </div>
                  )}
                </div>

                {editingId !== tag.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGlobal(tag.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
