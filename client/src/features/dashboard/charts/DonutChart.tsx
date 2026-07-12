import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

interface PieDataPoint {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: PieDataPoint[];
  colors?: string[];
  innerRadius?: number;
  height?: number;
}

export function DonutChart({
  data,
  colors = CHART_COLORS,
  innerRadius = 52,
  height = 200,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      {/* Donut occupies its own fixed-height box (no legend stealing space,
          so the ring is never clipped and the center label stays centered). */}
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={innerRadius + 30}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{total}</span>
          <span className="text-xs text-gray-400">Total</span>
        </div>
      </div>

      {/* Custom HTML legend below the chart */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d, index) => (
          <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: colors[index % colors.length] }}
            />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
