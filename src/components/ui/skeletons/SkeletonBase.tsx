import React from "react";

interface SkeletonBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SkeletonBase({ className = "", ...props }: SkeletonBaseProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/60 dark:bg-gray-800/60 shimmer ${className}`}
      aria-busy="true"
      aria-hidden="true"
      {...props}
    />
  );
}
