import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "#dc2626",
  High: "#f97316",
  Medium: "#d97706",
  Low: "#16a34a",
};

interface ComplianceDataPoint {
  severity: string;
  count: number;
}

export function ComplianceBarChart({ data }: { data: ComplianceDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <YAxis type="category" dataKey="severity" tick={{ fontSize: 11, fill: "#4b5563" }} width={60} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [v, "Issues"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={SEVERITY_COLOR[entry.severity] ?? "#6b7280"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
