"use client";

import React, { ReactNode } from "react";
import { ImageIcon } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (item: T) => ReactNode;
  thClassName?: string;
  tdClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  idField?: keyof T;
  // Selection
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  // Responsive / Interaction
  onRowClick?: (item: T) => void;
  renderMobileCard?: (
    item: T,
    isSelected: boolean,
    onToggleSelect: () => void,
  ) => ReactNode;
  emptyState?: ReactNode;
  tableWrapperClassName?: string;
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  idField = "id" as keyof T,
  enableSelection = false,
  selectedIds = [],
  onSelectChange,
  onRowClick,
  renderMobileCard,
  emptyState,
  tableWrapperClassName = "hidden md:block overflow-x-auto overflow-hidden w-full rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800",
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange(data.map((item) => String(item[idField])));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter((item) => item !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop Skeleton */}
        <div className="hidden md:block space-y-3 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex px-6 py-2.5 justify-between items-center opacity-30 select-none">
            {enableSelection && (
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
            )}
            {columns.map((col, idx) => (
              <div
                key={idx}
                className={`h-3 bg-gray-200 dark:bg-gray-700 rounded uppercase tracking-widest ${col.thClassName || "w-20"}`}
              />
            ))}
          </div>
          {/* Table Rows Skeleton */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-6 items-center px-6 py-4 border-b border-gray-100 dark:border-gray-750/30"
            >
              {enableSelection && (
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
              )}
              {columns.map((col, idx) => {
                if (
                  col.key === "image" ||
                  col.key === "selection" ||
                  col.key === "checkbox"
                ) {
                  return (
                    <div
                      key={idx}
                      className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"
                    />
                  );
                }
                if (col.key === "actions") {
                  return (
                    <div key={idx} className="flex gap-2 ml-auto justify-end">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className={`space-y-2 ${col.tdClassName || ""}`}
                    style={{
                      width: col.thClassName?.match(/\[(.*?)\]/)?.[1] || "15%",
                    }}
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile Skeleton */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-lg p-4 space-y-3 animate-pulse shadow-sm"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      emptyState || (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg">
          <ImageIcon size={48} className="mb-3 opacity-20" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            No records found
          </p>
        </div>
      )
    );
  }

  return (
    <div className="w-full">
      {/* Traditional Table View for Desktop */}
      <div className={tableWrapperClassName}>
        <table className="w-full text-left border-collapse min-w-[800px] text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/80">
              {enableSelection && (
                <th className="px-6 py-3.5 w-[5%] align-middle text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-650 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700 w-4 h-4 cursor-pointer transition-colors"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 ${
                    col.thClassName || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const itemId = String(item[idField]);
              const isSelected = selectedIds.includes(itemId);
              return (
                <tr
                  key={itemId}
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${isSelected ? "bg-emerald-50/40 dark:bg-emerald-500/5" : ""}`}
                >
                  {enableSelection && (
                    <td
                      className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-650 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700 w-4 h-4 cursor-pointer transition-colors"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectOne(itemId, e.target.checked)
                        }
                      />
                    </td>
                  )}
                  {columns.map((col, index) => {
                    return (
                      <td
                        key={col.key}
                        className={`px-6 py-4 align-middle text-gray-700 dark:text-gray-250 border border-gray-200 dark:border-gray-750 ${col.tdClassName || ""}`}
                      >
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Card List for Mobile */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {data.map((item) => {
          const itemId = String(item[idField]);
          const isSelected = selectedIds.includes(itemId);
          const onToggleSelect = () => handleSelectOne(itemId, !isSelected);

          // If a custom mobile cell builder is provided
          if (renderMobileCard) {
            return (
              <React.Fragment key={itemId}>
                {renderMobileCard(item, isSelected, onToggleSelect)}
              </React.Fragment>
            );
          }

          // Default fallback generic card layout (auto-derived)
          return (
            <div
              key={itemId}
              onClick={() => onRowClick?.(item)}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3 shadow-[0_2px_8px_0_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-md ${
                isSelected
                  ? "border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-300 dark:ring-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-500/5"
                  : "border-gray-100 dark:border-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {enableSelection && (
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-650 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700 w-4.5 h-4.5 cursor-pointer shrink-0"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelect();
                    }}
                  />
                )}
                <div className="flex-1 space-y-2.5">
                  {columns.map((col) => {
                    // Skip render columns that are pure action buttons or selections
                    if (
                      col.key === "actions" ||
                      col.key === "selection" ||
                      col.key === "checkbox"
                    )
                      return null;
                    return (
                      <div
                        key={col.key}
                        className="flex justify-between items-start gap-3"
                      >
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          {col.header}
                        </span>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">
                          {col.render
                            ? col.render(item)
                            : (item as any)[col.key]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
