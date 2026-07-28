"use client";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import { Trash2, RotateCcw, AlertTriangle, FileWarning } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Link from "next/link";

interface TrashItem {
  id: string;
  entityType: string;
  name: string;
  deletedAt: string;
  deletedBy: string;
}

export default function TrashBinPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/trash`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      showToast.error("Failed to load trash bin items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (model: string, id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/trash/restore/${model.toLowerCase()}/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        showToast.success("Item restored successfully");
        fetchTrash();
      } else {
        throw new Error(data.message || "Failed to restore item");
      }
    } catch (error: any) {
      showToast.error(error.message || "Error restoring item");
    }
  };

  const handlePurge = async (model: string, id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the item. You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, permanently delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/api/trash/purge/${model.toLowerCase()}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        if (res.ok && data.success) {
          showToast.success("Item permanently deleted");
          fetchTrash();
        } else {
          throw new Error(data.message || "Failed to delete item");
        }
      } catch (error: any) {
        showToast.error(error.message || "Error deleting item");
      }
    }
  };

  const columns: DataTableColumn<TrashItem>[] = [
    {
      key: "entityType",
      header: "Entity Type",
      render: (item) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium uppercase tracking-wider">
          {item.entityType}
        </span>
      ),
    },
    {
      key: "name",
      header: "Identifier / Name",
      render: (item) => (
        <span
          className="font-medium text-gray-900 line-clamp-1"
          title={item.name}
        >
          {item.name}
        </span>
      ),
    },
    {
      key: "deletedAt",
      header: "Deleted At",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-gray-900">
            {new Date(item.deletedAt).toLocaleDateString()}
          </span>
          <span className="text-gray-500 text-xs">
            {new Date(item.deletedAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      key: "deletedBy",
      header: "Deleted By",
      render: (item) => <span className="text-gray-600">{item.deletedBy}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      tdClassName: "text-right text-right min-w-[120px]",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRestore(item.entityType, item.id);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 group"
            title="Restore Item"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-medium hidden group-hover:inline">
              Restore
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePurge(item.entityType, item.id);
            }}
            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1 group"
            title="Permanently Delete"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs font-medium hidden group-hover:inline">
              Purge
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-pink-500" />
            Trash Bin
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            View and restore soft-deleted records or permanently purge them.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
            <FileWarning className="w-12 h-12 text-gray-300" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-500">
                Trash Bin is Empty
              </p>
              <p className="text-sm">No recently deleted records found.</p>
            </div>
          </div>
        ) : (
          <DataTable data={items} columns={columns} />
        )}
      </div>
    </div>
  );
}
