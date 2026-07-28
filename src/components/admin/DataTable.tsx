"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onSearch,
  searchPlaceholder = "Search...",
  actions,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Client-side search filter (if no server-side onSearch)
    if (searchQuery && !onSearch) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        columns.some((col) => {
          const val = item[col.key];
          return val && String(val).toLowerCase().includes(q);
        }),
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortDir, columns, onSearch]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[clamp(1rem,3vw,1.5rem)] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Search Bar */}
      <div className="p-[clamp(1rem,3vw,1.5rem)] border-b border-gray-200 dark:border-gray-700">
        <div className="relative max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] rounded-[clamp(0.75rem,2vw,1rem)] border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-left text-[clamp(0.65rem,1.5vw,0.75rem)] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                    col.sortable
                      ? "cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1 min-h-[44px]">
                    {col.label}
                    {col.sortable &&
                      sortKey === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] text-right text-[clamp(0.65rem,1.5vw,0.75rem)] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <div className="min-h-[44px] flex items-center justify-end">
                    Actions
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(2rem,6vw,3rem)] text-center text-gray-400 dark:text-gray-500 text-[clamp(0.875rem,2vw,1rem)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.875rem,2vw,1rem)] text-[clamp(0.875rem,2vw,1rem)] text-gray-700 dark:text-gray-300 whitespace-nowrap min-h-[44px]"
                    >
                      {col.render ? col.render(item) : (item[col.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.875rem,2vw,1rem)] text-right">
                      <div className="flex items-center justify-end gap-2 min-h-[44px]">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
