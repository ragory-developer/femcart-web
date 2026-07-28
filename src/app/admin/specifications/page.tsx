"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import {
  Check,
  Edit2,
  Filter,
  List,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SpecificationValue {
  id: string;
  value: string;
  showOnFilter: boolean;
}

interface Specification {
  id: string;
  name: string;
  slug: string;
  showOnFilter: boolean;
  values: SpecificationValue[];
}

const API = `${API_URL}/api/specifications`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function SpecificationsPage() {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpec, setActiveSpec] = useState<Specification | null>(null);

  const [newSpecName, setNewSpecName] = useState("");
  const [newValueName, setNewValueName] = useState("");
  const [savingSpec, setSavingSpec] = useState(false);
  const [savingValue, setSavingValue] = useState(false);

  // Search states
  const [searchSpec, setSearchSpec] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Edit states
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [editingSpecName, setEditingSpecName] = useState("");
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueName, setEditingValueName] = useState("");

  const fetchSpecifications = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) {
        setSpecifications(json.data || []);
        // Update activeSpec reference if it exists
        if (activeSpec) {
          const updated = json.data.find(
            (a: Specification) => a.id === activeSpec.id,
          );
          setActiveSpec(updated || null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Specification Logic ---
  const handleCreateSpecification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    setSavingSpec(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newSpecName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNewSpecName("");
        fetchSpecifications();
        setActiveSpec(json.data);
      } else {
        showToast.error(json.message || "Failed to create specification");
      }
    } catch {
      showToast.error("Network error");
    } finally {
      setSavingSpec(false);
    }
  };

  const handleDeleteSpecification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this specification and all its values forever?"))
      return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        if (activeSpec?.id === id) setActiveSpec(null);
        fetchSpecifications();
      } else {
        showToast.error("Failed to delete");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  const handleUpdateSpecification = async (
    id: string,
    name: string,
    showOnFilter: boolean,
  ) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: name.trim(), showOnFilter }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingSpecId(null);
        fetchSpecifications();
      } else {
        showToast.error(json.message || "Failed to update specification");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  // --- Specification Value Logic ---
  const handleCreateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpec || !newValueName.trim()) return;
    setSavingValue(true);
    try {
      const res = await fetch(`${API}/${activeSpec.id}/values`, {
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
        fetchSpecifications();
      } else {
        showToast.error(json.message || "Failed to create value");
      }
    } catch {
      showToast.error("Network error");
    } finally {
      setSavingValue(false);
    }
  };

  const handleDeleteValue = async (valId: string) => {
    if (!activeSpec) return;
    if (!confirm("Remove this value?")) return;
    try {
      const res = await fetch(`${API}/${activeSpec.id}/values/${valId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        fetchSpecifications();
      } else {
        showToast.error("Failed to delete value");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  const handleUpdateValue = async (
    valId: string,
    valueName: string,
    showOnFilter: boolean,
  ) => {
    if (!activeSpec) return;
    try {
      const res = await fetch(`${API}/${activeSpec.id}/values/${valId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ value: valueName.trim(), showOnFilter }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEditingValueId(null);
        fetchSpecifications();
      } else {
        showToast.error(json.message || "Failed to update value");
      }
    } catch {
      showToast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading specifications...
      </div>
    );
  }

  const filteredSpecifications = specifications.filter((a) =>
    a.name.toLowerCase().includes(searchSpec.toLowerCase()),
  );
  const filteredValues =
    activeSpec?.values.filter((v) =>
      v.value.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Product Specifications
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage variable product specifications like Brand, Processor, RAM,
          Size, or Color.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SPECIFICATIONS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <List size={18} className="text-emerald-600" /> All
                Specifications
              </h3>

              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search specifications..."
                  value={searchSpec}
                  onChange={(e) => setSearchSpec(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                />
              </div>

              <form onSubmit={handleCreateSpecification} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Processor"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={savingSpec || !newSpecName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSpecifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400 italic">
                  No specifications found.
                </div>
              ) : (
                filteredSpecifications.map((spec) => (
                  <div
                    key={spec.id}
                    onClick={() => setActiveSpec(spec)}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      activeSpec?.id === spec.id
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-transparent"
                    }`}
                  >
                    <div>
                      {editingSpecId === spec.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateSpecification(
                              spec.id,
                              editingSpecName,
                              spec.showOnFilter,
                            );
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={editingSpecName}
                            onChange={(e) => setEditingSpecName(e.target.value)}
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
                              e.preventDefault();
                              e.stopPropagation();
                              handleUpdateSpecification(
                                spec.id,
                                editingSpecName,
                                !spec.showOnFilter,
                              );
                            }}
                            title={
                              spec.showOnFilter
                                ? "Disable Search Filter"
                                : "Enable Search Filter"
                            }
                            className={`relative z-10 p-1.5 rounded-lg transition-all border cursor-pointer hover:shadow-md active:scale-95 ${
                              spec.showOnFilter
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                                : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <Filter
                              size={16}
                              className={
                                spec.showOnFilter ? "stroke-[3]" : "stroke-[2]"
                              }
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSpecId(null);
                            }}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <p
                            className={`font-semibold text-sm ${activeSpec?.id === spec.id ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                          >
                            {spec.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {spec.values.length} values
                          </p>
                        </>
                      )}
                    </div>
                    {editingSpecId !== spec.id && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUpdateSpecification(
                              spec.id,
                              spec.name,
                              !spec.showOnFilter,
                            );
                          }}
                          title={
                            spec.showOnFilter
                              ? "Disable Search Filter"
                              : "Enable Search Filter"
                          }
                          className={`relative z-10 p-2 rounded-xl transition-all border cursor-pointer hover:shadow-md active:scale-95 ${
                            spec.showOnFilter
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Filter
                            size={18}
                            className={
                              spec.showOnFilter ? "stroke-[3]" : "stroke-[2]"
                            }
                          />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingSpecId(spec.id);
                              setEditingSpecName(spec.name);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) =>
                              handleDeleteSpecification(spec.id, e)
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SPECIFICATION VALUES */}
        <div className="lg:col-span-8">
          {!activeSpec ? (
            <div className="h-[600px] bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
              <Settings
                size={48}
                className="mb-4 text-gray-300 dark:text-gray-600"
              />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Select a specification
              </p>
              <p className="text-sm">
                Click a specification on the left to manage its values
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {activeSpec.name}{" "}
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
                    placeholder={`Add new value (e.g. ${activeSpec.name === "Processor" ? "Intel i7" : activeSpec.name === "RAM" ? "16GB" : "Value"})`}
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
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateValue(
                                val.id,
                                editingValueName,
                                val.showOnFilter,
                              );
                            }}
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateValue(
                                  val.id,
                                  editingValueName,
                                  !val.showOnFilter,
                                );
                              }}
                              title={
                                val.showOnFilter
                                  ? "Disable Search Filter"
                                  : "Enable Search Filter"
                              }
                              className={`relative z-10 p-1 rounded-md transition-all border cursor-pointer hover:shadow-md active:scale-95 ${
                                val.showOnFilter
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <Filter
                                size={16}
                                className={
                                  val.showOnFilter ? "stroke-[3]" : "stroke-[2]"
                                }
                              />
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
                            <div className="flex items-center gap-1.5 transition-all translate-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateValue(
                                    val.id,
                                    val.value,
                                    !val.showOnFilter,
                                  );
                                }}
                                title={
                                  val.showOnFilter
                                    ? "Disable Search Filter"
                                    : "Enable Search Filter"
                                }
                                className={`relative z-10 p-1.5 rounded-md transition-all border cursor-pointer hover:shadow-md active:scale-95 ${
                                  val.showOnFilter
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                <Filter
                                  size={14}
                                  className={
                                    val.showOnFilter
                                      ? "stroke-[3]"
                                      : "stroke-[2]"
                                  }
                                />
                              </button>
                              <div className="flex items-center">
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
