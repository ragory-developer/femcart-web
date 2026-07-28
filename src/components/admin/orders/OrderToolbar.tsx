import { Search } from "lucide-react";

interface OrderToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  statuses: { label: string; value: string }[];
  currentStatus: string;
  handleStatusFilter: (status: string) => void;
}

export function OrderToolbar({
  searchQuery,
  setSearchQuery,
  limit,
  setLimit,
  statuses,
  currentStatus,
  handleStatusFilter,
}: OrderToolbarProps) {
  return (
    <>
      {/* Toolbar: Search & Records Dropdown */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Live Search */}
        <div className="relative w-full lg:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Name or Mobile Number..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Results Per Page Dropdown */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden md:block">
            Records:
          </span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all shadow-sm"
          >
            <option value={10}>10 results</option>
            <option value={25}>25 results</option>
            <option value={50}>50 results</option>
            <option value={100}>100 results</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs (Condensed) */}
      <div className="flex flex-wrap gap-2 pb-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusFilter(s.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              currentStatus === s.value
                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-emerald-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </>
  );
}
