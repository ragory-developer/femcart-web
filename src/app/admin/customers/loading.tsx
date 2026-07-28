import React from "react";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function AdminTableLoading() {
  return (
    <div className="space-y-6">
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
