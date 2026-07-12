import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}


function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} style={style} />
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Skeleton className="h-11 w-11 rounded-xl mb-3" />
      <Skeleton className="h-7 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton style={{ height }} className="w-full rounded-xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <Skeleton className="h-4 w-40 mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
