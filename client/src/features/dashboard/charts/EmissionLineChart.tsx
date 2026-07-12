import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

interface LineDataPoint {
  month: string;
  [key: string]: string | number;
}

interface EmissionLineChartProps {
  data: LineDataPoint[];
  dataKey?: string;
  color?: string;
  unit?: string;
  label?: string;
  refValue?: number;
}

export function EmissionLineChart({
  data,
  dataKey = "emissions",
  color = CHART_COLORS[2],
  unit = "kgCO₂e",
  label = "Emissions",
  refValue,
}: EmissionLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
        {refValue && (
          <ReferenceLine y={refValue} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#dc2626" }} />
        )}
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v} ${unit}`, label]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
