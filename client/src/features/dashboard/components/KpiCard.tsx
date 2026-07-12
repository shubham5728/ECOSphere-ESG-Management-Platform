interface KpiCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;       // positive = up, negative = down
  deltaLabel?: string;
  accent?: string;      // tailwind bg class for icon bg
  onClick?: () => void;
}

export function KpiCard({
  icon,
  label,
  value,
  unit,
  delta,
  deltaLabel,
  accent = "bg-green-50",
  onClick,
}: KpiCardProps) {
  const isPositive = delta !== undefined && delta >= 0;
  const hasClick = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl bg-white border border-gray-100 p-5 shadow-sm transition-all duration-200
        ${hasClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-green-200" : ""}`}
    >
      {/* Icon */}
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent} mb-3`}>
        {icon}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold text-gray-900 leading-none">{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-0.5">{unit}</span>}
      </div>

      {/* Label */}
      <p className="mt-1 text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>

      {/* Delta */}
      {delta !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(delta)}% {deltaLabel ?? "vs last month"}</span>
        </div>
      )}

      {/* Hover arrow */}
      {hasClick && (
        <span className="absolute right-4 top-4 text-gray-200 text-sm group-hover:text-green-400 transition-colors">→</span>
      )}
    </div>
  );
}
