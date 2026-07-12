import { Award } from "lucide-react";
import type { LeaderEntry } from "../data/mockData";

const RANK_STYLE: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-gray-300 text-gray-700",
  3: "bg-orange-300 text-white",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-green-500", "bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-orange-500",
];

interface LeaderboardTableProps {
  entries: LeaderEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <th className="py-2 text-left w-10">#</th>
            <th className="py-2 text-left">Employee</th>
            <th className="py-2 text-right">XP</th>
            <th className="py-2 text-right">Points</th>
            <th className="py-2"><Award size={14} className="ml-auto text-amber-500" /></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.rank}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                    ${RANK_STYLE[e.rank] ?? "bg-gray-100 text-gray-500"}`}
                >
                  {e.rank}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0
                      ${AVATAR_COLORS[(e.rank - 1) % AVATAR_COLORS.length]}`}
                  >
                    {getInitials(e.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{e.name}</p>
                    <p className="text-xs text-gray-400">{e.dept}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-right font-semibold text-gray-700">{e.xp.toLocaleString()}</td>
              <td className="py-3 text-right text-gray-500">{e.points.toLocaleString()}</td>
              <td className="py-3 text-right text-gray-700 font-medium">{e.badges}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
