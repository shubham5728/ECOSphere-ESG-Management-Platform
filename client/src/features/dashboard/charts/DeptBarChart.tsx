import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

interface DeptBarData {
  dept: string;
  env: number;
  social: number;
  gov: number;
}

export function DeptBarChart({ data }: { data: DeptBarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#6b7280" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="env" name="Environmental" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
        <Bar dataKey="social" name="Social" fill={CHART_COLORS[1]} radius={[3, 3, 0, 0]} />
        <Bar dataKey="gov" name="Governance" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
