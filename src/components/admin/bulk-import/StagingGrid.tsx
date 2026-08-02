import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Loader2, Download, CheckCircle, AlertCircle, PlayCircle, Save } from "lucide-react";
import Swal from "sweetalert2";

interface StagingRow {
  id: string;
  status: string;
  name: string | null;
  sku: string | null;
  price: number | null;
  comparePrice: number | null;
  stock: number | null;
  brandName: string | null;
  categories: string | null;
  options: string | null;
  errors: any | null;
}

interface StagingGridProps {
  logId: string;
  onCommitSuccess?: () => void;
}

export default function StagingGrid({ logId, onCommitSuccess }: StagingGridProps) {
  const [rows, setRows] = useState<StagingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("ALL"); // ALL, VALID, INVALID, IMPORTED
  
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StagingRow>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);

  useEffect(() => {
    fetchStaging();
  }, [logId, page, filter]);

  const fetchStaging = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/bulk-import/staging/${logId}?page=${page}&limit=20&status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setRows(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (includeInvalid = false) => {
    const result = await Swal.fire({
      title: includeInvalid ? "Force Publish All?" : "Publish Valid Rows?",
      text: includeInvalid 
        ? "Are you sure you want to FORCE add all rows including invalid ones to your live catalog? Missing data will be replaced with defaults (e.g. 'Untitled Product')." 
        : "Are you sure you want to publish all valid rows to your live catalog?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: includeInvalid ? "#f59e0b" : "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: includeInvalid ? "Yes, force publish" : "Yes, publish valid",
    });

    if (!result.isConfirmed) return;

    try {
      setCommitting(true);
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/bulk-import/staging/${logId}/commit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ includeInvalid })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Publishing Started!",
          text: "Check the dashboard in a few moments.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        if (onCommitSuccess) onCommitSuccess();
        fetchStaging();
      } else {
        Swal.fire("Error", json.message || "Failed to publish", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Publish failed.", "error");
    } finally {
      setCommitting(false);
    }
  };

  const handleDownloadErrors = async () => {
    try {
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/bulk-import/staging/${logId}/download-errors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        Swal.fire("No Errors", "Failed to download errors or no errors found.", "info");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `errors-${logId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscard = async () => {
    const result = await Swal.fire({
      title: "Cancel and Discard?",
      text: "Are you sure you want to completely cancel this import and discard all staged rows? This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, discard everything",
    });
    
    if (!result.isConfirmed) return;

    try {
      setDiscarding(true);
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/bulk-import/staging/${logId}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        if (onCommitSuccess) onCommitSuccess();
      } else {
        Swal.fire("Error", json.message || "Failed to discard", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Discard failed.", "error");
    } finally {
      setDiscarding(false);
    }
  };

  const startEdit = (row: StagingRow) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const saveRow = async (id: string) => {
    try {
      setSavingRow(id);
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/bulk-import/staging/row/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: editData.name,
          sku: editData.sku,
          price: editData.price,
          comparePrice: editData.comparePrice,
          stock: editData.stock,
          brandName: editData.brandName,
          categories: editData.categories
        })
      });
      const json = await res.json();
      if (json.success) {
        setEditingRow(null);
        fetchStaging(); // Refresh to get new status
      } else {
        Swal.fire("Error", "Failed to save: " + json.message, "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Failed to save row", "error");
    } finally {
      setSavingRow(null);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          Staging Data Review
        </h4>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="ALL">All Rows</option>
            <option value="VALID">Ready to Publish</option>
            <option value="INVALID">Needs Fix</option>
            <option value="IMPORTED">Published</option>
          </select>
          <button 
            onClick={handleDiscard}
            disabled={discarding || committing}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
            title="Discard entirely"
          >
            {discarding ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
            Cancel & Discard
          </button>
          <button 
            onClick={handleDownloadErrors}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            <Download size={14} /> Download Errors
          </button>
          <button 
            onClick={() => handleCommit(false)}
            disabled={committing || discarding}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {committing ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            Publish Valid Products
          </button>
          <button 
            onClick={() => handleCommit(true)}
            disabled={committing || discarding}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
            title="Import all rows, ignoring validation errors"
          >
            Force Publish All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 size={24} className="animate-spin text-emerald-600" /></div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white dark:bg-gray-950 font-semibold border-b border-gray-200 dark:border-gray-800 text-gray-500 whitespace-nowrap">
                <th className="px-3 py-2 sticky left-0 bg-white dark:bg-gray-950 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">Status</th>
                <th className="px-3 py-2 min-w-[200px]">Name</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Compare At</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2 min-w-[150px]">Categories</th>
                <th className="px-3 py-2 min-w-[150px]">Variant Options</th>
                <th className="px-3 py-2 min-w-[150px]">Errors</th>
                <th className="px-3 py-2 text-right sticky right-0 bg-white dark:bg-gray-950 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">No rows found.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 whitespace-nowrap group">
                  <td className="px-3 py-2 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">
                    {r.status === 'VALID' && <span className="text-emerald-600 flex items-center gap-1 font-bold"><CheckCircle size={12}/> Valid</span>}
                    {r.status === 'INVALID' && <span className="text-rose-600 flex items-center gap-1 font-bold"><AlertCircle size={12}/> Invalid</span>}
                    {r.status === 'IMPORTED' && <span className="text-blue-600 flex items-center gap-1 font-bold"><CheckCircle size={12}/> Imported</span>}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {editingRow === r.id ? (
                      <input 
                        type="text" 
                        value={editData.name || ""} 
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className={`w-full min-w-[180px] p-1 border rounded text-xs dark:bg-gray-800 ${r.errors?.name ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Name"
                      />
                    ) : (
                      <div className="truncate max-w-[250px]" title={r.name || ''}>{r.name || '-'}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="text" 
                        value={editData.sku || ""} 
                        onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                        className={`w-28 p-1 border rounded text-xs dark:bg-gray-800 ${r.errors?.sku ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="SKU"
                      />
                    ) : (r.sku || '-')}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="number" 
                        value={editData.price || ""} 
                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                        className={`w-24 p-1 border rounded text-xs dark:bg-gray-800 ${r.errors?.price ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Price"
                      />
                    ) : (r.price !== null ? `$${r.price}` : '-')}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="number" 
                        value={editData.comparePrice || ""} 
                        onChange={(e) => setEditData({ ...editData, comparePrice: parseFloat(e.target.value) })}
                        className="w-24 p-1 border rounded text-xs dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="Compare"
                      />
                    ) : (r.comparePrice !== null ? <span className="line-through text-gray-400">${r.comparePrice}</span> : '-')}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="number" 
                        value={editData.stock || ""} 
                        onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                        className={`w-20 p-1 border rounded text-xs dark:bg-gray-800 ${r.errors?.stock ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                        placeholder="Qty"
                      />
                    ) : (r.stock !== null ? r.stock : '-')}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="text" 
                        value={editData.brandName || ""} 
                        onChange={(e) => setEditData({ ...editData, brandName: e.target.value })}
                        className="w-24 p-1 border rounded text-xs dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="Brand"
                      />
                    ) : (r.brandName || '-')}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === r.id ? (
                      <input 
                        type="text" 
                        value={editData.categories || ""} 
                        onChange={(e) => setEditData({ ...editData, categories: e.target.value })}
                        className="w-32 p-1 border rounded text-xs dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        placeholder="Categories"
                      />
                    ) : (
                      <div className="truncate max-w-[150px]" title={r.categories || ''}>{r.categories || '-'}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.options ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(() => {
                          try {
                            const opts = JSON.parse(r.options);
                            return opts.map((o: any, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                <strong className="font-semibold">{o.name}:</strong> {o.value}
                              </span>
                            ));
                          } catch {
                            return <span className="text-gray-400">Invalid JSON</span>;
                          }
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-rose-500 max-w-[200px] whitespace-normal">
                    {r.errors ? Object.values(r.errors).join(', ') : '-'}
                  </td>
                  <td className="px-3 py-2 text-right sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 shadow-[-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">
                    {editingRow === r.id ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => saveRow(r.id)} disabled={savingRow === r.id} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                          {savingRow === r.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                        <button onClick={() => setEditingRow(null)} className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs font-bold px-2">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(r)} disabled={r.status === 'IMPORTED'} className="text-blue-500 hover:underline font-bold text-xs disabled:opacity-30 disabled:hover:no-underline">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-3 text-xs">
        <span className="text-gray-500">Page {page} of {totalPages || 1}</span>
        <div className="flex gap-1">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            Prev
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
