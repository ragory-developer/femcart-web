"use client";

import { API_URL } from "@/lib/config";
import {
  Edit2,
  Plus,
  Trash2,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type FooterLink = {
  id: string;
  sectionId: string;
  title: string;
  url: string;
  target: string;
  sortOrder: number;
  isActive: boolean;
};

type FooterSection = {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links: FooterLink[];
};

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function FooterManager() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Section Form State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(
    null,
  );
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionIsActive, setSectionIsActive] = useState(true);

  // Link Form State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTarget, setLinkTarget] = useState("_self");
  const [linkIsActive, setLinkIsActive] = useState(true);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllExpanded = (expand: boolean) => {
    const newExpanded: Record<string, boolean> = {};
    if (expand) {
      sections.forEach((sec) => {
        newExpanded[sec.id] = true;
      });
    }
    setExpandedSections(newExpanded);
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const [res] = await Promise.all([
        fetch(`${API_URL}/api/navigation/footer/sections`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }),
      ]);
      const json = await res.json();
      if (json.success) setSections(json.data);
    } catch (err) {
      toast.error("Failed to load footer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // --- Section Handlers ---
  const openAddSection = () => {
    setEditingSection(null);
    setSectionTitle("");
    setSectionIsActive(true);
    setIsSectionModalOpen(true);
  };

  const openEditSection = (sec: FooterSection) => {
    setEditingSection(sec);
    setSectionTitle(sec.title);
    setSectionIsActive(sec.isActive);
    setIsSectionModalOpen(true);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: sectionTitle, isActive: sectionIsActive };
    try {
      const res = await fetch(
        `${API_URL}/api/navigation/footer/sections${editingSection ? `/${editingSection.id}` : ""}`,
        {
          method: editingSection ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success(editingSection ? "Section updated" : "Section created");
        setIsSectionModalOpen(false);
        fetchSections();
        if (!editingSection && json.data) {
          setExpandedSections((prev) => ({ ...prev, [json.data.id]: true }));
        }
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to save section");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (
      !confirm("Are you sure? This will delete the section and all its links.")
    )
      return;
    try {
      const res = await fetch(
        `${API_URL}/api/navigation/footer/sections/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success("Section deleted");
        fetchSections();
      }
    } catch (err) {
      toast.error("Failed to delete section");
    }
  };

  // --- Link Handlers ---
  const openAddLink = (sectionId: string) => {
    setEditingLink(null);
    setActiveSectionId(sectionId);
    setLinkTitle("");
    setLinkUrl("");
    setLinkTarget("_self");
    setLinkIsActive(true);
    setIsLinkModalOpen(true);
    setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const openEditLink = (link: FooterLink) => {
    setEditingLink(link);
    setActiveSectionId(link.sectionId);
    setLinkTitle(link.title);
    setLinkUrl(link.url);
    setLinkTarget(link.target);
    setLinkIsActive(link.isActive);
    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sectionId: activeSectionId,
      title: linkTitle,
      url: linkUrl,
      target: linkTarget,
      isActive: linkIsActive,
    };
    try {
      const res = await fetch(
        `${API_URL}/api/navigation/footer/links${editingLink ? `/${editingLink.id}` : ""}`,
        {
          method: editingLink ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success(editingLink ? "Link updated" : "Link created");
        setIsLinkModalOpen(false);
        fetchSections();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to save link");
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`${API_URL}/api/navigation/footer/links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Link deleted");
        fetchSections();
      }
    } catch (err) {
      toast.error("Failed to delete link");
    }
  };

  const toggleSectionStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/api/navigation/footer/sections/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchSections();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const toggleLinkStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/api/navigation/footer/links/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchSections();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Footer Columns & Links
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setAllExpanded(true)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Expand All
            </button>
            <button
              onClick={() => setAllExpanded(false)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Collapse All
            </button>
          </div>
          <button
            onClick={openAddSection}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New Column
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4 w-1/2">Column & Link Title</th>
                <th className="px-6 py-4 w-1/4">Status</th>
                <th className="px-6 py-4 w-1/4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading footer data...
                  </td>
                </tr>
              ) : sections.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No footer columns found.
                  </td>
                </tr>
              ) : (
                sections.map((sec) => {
                  const isExpanded = expandedSections[sec.id];
                  const hasLinks = sec.links && sec.links.length > 0;

                  return (
                    <React.Fragment key={sec.id}>
                      {/* Section Row */}
                      <tr
                        className={`border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors ${!sec.isActive ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <button
                                onClick={() => toggleSection(sec.id)}
                                className="w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-gray-300 dark:hover:bg-gray-700"
                              >
                                <ChevronRight
                                  size={16}
                                  className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                />
                              </button>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white text-[15px] flex items-center gap-2">
                                {sec.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {sec.links?.length || 0} links configured
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              toggleSectionStatus(sec.id, sec.isActive)
                            }
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sec.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sec.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                            ></div>
                            {sec.isActive ? "Active" : "Hidden"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openAddLink(sec.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Add Link"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => openEditSection(sec)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Edit Column"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-400 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Delete Column"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Links Rows */}
                      {isExpanded &&
                        (!hasLinks ? (
                          <tr className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                            <td
                              colSpan={3}
                              className="px-6 py-4 pl-16 text-sm text-gray-400 border-l-2 border-emerald-500/20"
                            >
                              No links in this column. Click "Add Link" to
                              create one.
                            </td>
                          </tr>
                        ) : (
                          sec.links.map((link) => (
                            <tr
                              key={link.id}
                              className={`border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors bg-white dark:bg-gray-950 ${!link.isActive ? "opacity-60" : ""}`}
                            >
                              <td className="px-6 py-3 pl-16 border-l-2 border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                    <LinkIcon
                                      size={12}
                                      className="text-gray-400"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                      {link.title}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                      {link.url}
                                      {link.target === "_blank" && (
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1 bg-gray-100 dark:bg-gray-800 rounded">
                                          New Tab
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 border-l-2 border-emerald-500/20">
                                <button
                                  onClick={() =>
                                    toggleLinkStatus(link.id, link.isActive)
                                  }
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${link.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${link.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                                  ></div>
                                  {link.isActive ? "Active" : "Hidden"}
                                </button>
                              </td>
                              <td className="px-6 py-3 text-right border-l-2 border-emerald-500/20">
                                <div className="flex items-center justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEditLink(link)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-gray-500 transition-colors"
                                    title="Edit Link"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLink(link.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-400 text-gray-500 transition-colors"
                                    title="Delete Link"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingSection ? "Edit Footer Column" : "Add Footer Column"}
            </h3>
            <form
              onSubmit={handleSectionSubmit}
              className="space-y-5 text-gray-900 dark:text-white"
            >
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Column Title
                </label>
                <input
                  required
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Quick Links"
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="secIsActive"
                  checked={sectionIsActive}
                  onChange={(e) => setSectionIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="secIsActive"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingSection ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingLink ? "Edit Footer Link" : "Add Footer Link"}
            </h3>
            <form
              onSubmit={handleLinkSubmit}
              className="space-y-5 text-gray-900 dark:text-white"
            >
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Link Title
                </label>
                <input
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  URL / Destination
                </label>
                <input
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. /about"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Target
                  </label>
                  <select
                    value={linkTarget}
                    onChange={(e) => setLinkTarget(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Parent Column
                  </label>
                  <select
                    value={activeSectionId}
                    onChange={(e) => setActiveSectionId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-2">
                <input
                  type="checkbox"
                  id="linkIsActive"
                  checked={linkIsActive}
                  onChange={(e) => setLinkIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="linkIsActive"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingLink ? "Update Link" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
