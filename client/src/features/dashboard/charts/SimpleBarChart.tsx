import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

interface SimpleBarData {
  [key: string]: string | number;
}

interface SimpleBarChartProps {
  data: SimpleBarData[];
  xKey: string;
  dataKey: string;
  color?: string;
  unit?: string;
  label?: string;
}

export function SimpleBarChart({
  data,
  xKey,
  dataKey,
  color = CHART_COLORS[0],
  unit = "",
  label = "Count",
}: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v}${unit ? " " + unit : ""}`, label]}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
