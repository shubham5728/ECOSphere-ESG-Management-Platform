const STATUS_COLOR: Record<string, string> = {
  ON_TRACK: "bg-green-500",
  AT_RISK: "bg-amber-400",
  COMPLETED: "bg-blue-500",
};

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  COMPLETED: "Done",
};

interface GoalItem {
  goal: string;
  progress: number;
  status: string;
}

interface GoalProgressCardsProps {
  items: GoalItem[];
}

export function GoalProgressCards({ items }: GoalProgressCardsProps) {
  return (
    <div className="space-y-3">
      {items.map((g) => (
        <div key={g.goal} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-800 truncate pr-2">{g.goal}</p>
            <span
              className={`text-xs text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0
                ${g.status === "ON_TRACK" ? "bg-green-500" : g.status === "AT_RISK" ? "bg-amber-400" : "bg-blue-500"}`}
            >
              {STATUS_LABEL[g.status] ?? g.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${STATUS_COLOR[g.status] ?? "bg-gray-400"}`}
                style={{ width: `${Math.min(g.progress, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-9 text-right">{g.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
