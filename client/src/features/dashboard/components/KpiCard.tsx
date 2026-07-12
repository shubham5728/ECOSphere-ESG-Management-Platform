import { ArrowUpRight, ArrowDownRight, ArrowRight, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;       // positive = up, negative = down
  deltaLabel?: string;
  accent?: string;      // tailwind bg class for icon tile
  iconColor?: string;   // tailwind text color for the icon
  onClick?: () => void;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  deltaLabel,
  accent = "bg-green-50",
  iconColor = "text-gray-700",
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
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent} mb-3`}>
        <Icon size={20} className={iconColor} strokeWidth={2} />
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
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(delta)}% {deltaLabel ?? "vs last month"}</span>
        </div>
      )}

      {/* Hover arrow */}
      {hasClick && (
        <ArrowRight
          size={16}
          className="absolute right-4 top-4 text-gray-200 group-hover:text-green-400 transition-colors"
        />
      )}
    </div>
  );
}
