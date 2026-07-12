import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";

interface EmployeeRank {
  id: string;
  name: string;
  xp: number;
  points: number;
  department?: { name: string } | null;
}

interface DepartmentRank {
  id: string;
  name: string;
  code: string;
  totalXp: number;
  totalPoints: number;
}

interface LeaderboardData {
  employees: EmployeeRank[];
  departments: DepartmentRank[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"EMPLOYEES" | "DEPARTMENTS">("EMPLOYEES");

  useEffect(() => {
    api
      .get<{ data: LeaderboardData }>("/gamification/leaderboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-sm text-gray-400 py-12">Loading leaderboard ranking...</div>;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 ESG Leaderboards</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time performance ranking of employees and departments based on ESG participation.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setTab("EMPLOYEES")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            tab === "EMPLOYEES" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          👤 Top Employees
        </button>
        <button
          onClick={() => setTab("DEPARTMENTS")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            tab === "DEPARTMENTS" ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          🏢 Department Ranking
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm max-w-2xl">
        {tab === "EMPLOYEES" ? (
          data.employees.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">No employee scores recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left w-16">Rank</th>
                  <th className="px-5 py-3 text-left">Employee</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">XP Points</th>
                  <th className="px-5 py-3 text-left">Redeemable Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {data.employees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-400">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{emp.name}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{emp.department?.name || "Unassigned"}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-600">⚡ {emp.xp}</td>
                    <td className="px-5 py-3.5 font-mono text-amber-600">🎁 {emp.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          data.departments.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">No department scores recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left w-16">Rank</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Total Department XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {data.departments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-400">
                      {index === 0 ? "🏆" : `#${index + 1}`}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{dept.name}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{dept.code}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-600">⚡ {dept.totalXp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
