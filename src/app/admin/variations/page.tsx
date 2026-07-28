"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import {
  Check,
  Edit2,
  List,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface VariationValue {
  id: string;
  value: string;
}

interface Variation {
  id: string;
  name: string;
  slug: string;
  values: VariationValue[];
}

const API = `${API_URL}/api/variations`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function VariationsPage() {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVariation, setActiveVariation] = useState<Variation | null>(
    null,
  );

  const [newVariationName, setNewVariationName] = useState("");
  const [newValueName, setNewValueName] = useState("");
  const [savingVariation, setSavingVariation] = useState(false);
  const [savingValue, setSavingValue] = useState(false);

  // Search states
  const [searchVariation, setSearchVariation] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Edit states
  const [editingVariationId, setEditingVariationId] = useState<string | null>(
    null,
  );
  const [editingVariationName, setEditingVariationName] = useState("");
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueName, setEditingValueName] = useState("");

  const fetchVariations = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) {
        setVariations(json.data || []);
        // Update activeVariation reference if it exists
        if (activeVariation) {
          const updated = json.data.find(
            (a: Variation) => a.id === activeVariation.id,
          );
          setActiveVariation(updated || null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Variation Logic ---
  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariationName.trim()) return;
    setSavingVariation(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newVariationName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNewVariationName("");
        fetchVariations();
        setActiveVariation(json.data);
      } else {
        showToast.error(json.message || "Failed to create variation");
      }
    } catch {
      showToast.error("Network error");
    } finally {
      setSavingVariation(false);
    }
  };

  const handleDeleteVariation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this variation and all its values forever?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        if (activeVariation?.id === id) setActiveVariation(null);
        fetchVariations();
      } else {
        showToast.error("Failed to delete");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  const handleUpdateVariation = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariationName.trim()) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: editingVariationName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingVariationId(null);
        fetchVariations();
      } else {
        showToast.error(json.message || "Failed to update variation");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  // --- Variation Value Logic ---
  const handleCreateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVariation || !newValueName.trim()) return;
    setSavingValue(true);
    try {
      const res = await fetch(`${API}/${activeVariation.id}/values`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ value: newValueName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNewValueName("");
        fetchVariations();
      } else {
        showToast.error(json.message || "Failed to create variation value");
      }
    } catch {
      showToast.error("Network error");
    } finally {
      setSavingValue(false);
    }
  };

  const handleDeleteValue = async (valId: string) => {
    if (!activeVariation) return;
    if (!confirm("Remove this value?")) return;
    try {
      const res = await fetch(`${API}/${activeVariation.id}/values/${valId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        fetchVariations();
      } else {
        showToast.error("Failed to delete value");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  const handleUpdateValue = async (valId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVariation || !editingValueName.trim()) return;
    try {
      const res = await fetch(`${API}/${activeVariation.id}/values/${valId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ value: editingValueName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingValueId(null);
        fetchVariations();
      } else {
        showToast.error(json.message || "Failed to update value");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading variations...</div>
    );
  }

  const filteredVariations = variations.filter((a) =>
    a.name.toLowerCase().includes(searchVariation.toLowerCase()),
  );
  const filteredValues =
    activeVariation?.values.filter((v) =>
      v.value.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Product Variations
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage variable product variations like Color, Size, Style, Size, or
          Color.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ATTRIBUTES */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <List size={18} className="text-emerald-600" /> All Variations
              </h3>

              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search variations..."
                  value={searchVariation}
                  onChange={(e) => setSearchVariation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                />
              </div>

              <form onSubmit={handleCreateVariation} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Color"
                  value={newVariationName}
                  onChange={(e) => setNewVariationName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={savingVariation || !newVariationName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {filteredVariations.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400 italic">
                  No variations found.
                </div>
              ) : (
                filteredVariations.map((variation) => (
                  <div
                    key={variation.id}
                    onClick={() => setActiveVariation(variation)}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      activeVariation?.id === variation.id
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-transparent"
                    }`}
                  >
                    <div>
                      {editingVariationId === variation.id ? (
                        <form
                          onSubmit={(e) =>
                            handleUpdateVariation(variation.id, e)
                          }
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={editingVariationName}
                            onChange={(e) =>
                              setEditingVariationName(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="px-2 py-1 text-sm border border-emerald-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full max-w-[120px] text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                          <button
                            type="submit"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingVariationId(null);
                            }}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <p
                            className={`font-semibold text-sm ${activeVariation?.id === variation.id ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                          >
                            {variation.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {variation.values.length} values
                          </p>
                        </>
                      )}
                    </div>
                    {editingVariationId !== variation.id && (
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingVariationId(variation.id);
                            setEditingVariationName(variation.name);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteVariation(variation.id, e)
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
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

        {/* RIGHT COLUMN: ATTRIBUTE VALUES */}
        <div className="lg:col-span-8">
          {!activeVariation ? (
            <div className="h-[600px] bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
              <Settings
                size={48}
                className="mb-4 text-gray-300 dark:text-gray-600"
              />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Select an variation
              </p>
              <p className="text-sm">
                Click an variation on the left to manage its values
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {activeVariation.name}{" "}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      Values
                    </span>
                  </h2>
                </div>
                <div className="relative w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search values..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-6 border-b border-gray-100 dark:border-gray-750">
                <form
                  onSubmit={handleCreateValue}
                  className="max-w-md flex gap-3"
                >
                  <input
                    type="text"
                    placeholder={`Add new value (e.g. ${activeVariation.name === "Color" ? "Red" : activeVariation.name === "Size" ? "XL" : "Value"})`}
                    value={newValueName}
                    onChange={(e) => setNewValueName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={savingValue || !newValueName.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Add Value
                  </button>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {filteredValues.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                      No values found.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredValues.map((val) => (
                      <div
                        key={val.id}
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-xl group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                      >
                        {editingValueId === val.id ? (
                          <form
                            onSubmit={(e) => handleUpdateValue(val.id, e)}
                            className="flex items-center gap-2 w-full"
                          >
                            <input
                              type="text"
                              value={editingValueName}
                              onChange={(e) =>
                                setEditingValueName(e.target.value)
                              }
                              autoFocus
                              className="flex-1 px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingValueId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                              {val.value}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 flex transition-all">
                              <button
                                onClick={() => {
                                  setEditingValueId(val.id);
                                  setEditingValueName(val.value);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteValue(val.id)}
                                className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
