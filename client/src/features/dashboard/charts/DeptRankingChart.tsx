import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS } from "../data/mockData";

interface RankingDataPoint {
  dept: string;
  score: number;
}

export function DeptRankingChart({ data }: { data: RankingDataPoint[] }) {
  const sorted = [...data].sort((a, b) => b.score - a.score);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "#4b5563" }} width={72} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v}`, "ESG Score"]}
        />
        <Bar dataKey="score" radius={[0, 5, 5, 0]} maxBarSize={22}>
          {sorted.map((_entry, i) => (
            <Cell
              key={i}
              fill={i === 0 ? CHART_COLORS[0] : i === 1 ? CHART_COLORS[1] : "#94a3b8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
