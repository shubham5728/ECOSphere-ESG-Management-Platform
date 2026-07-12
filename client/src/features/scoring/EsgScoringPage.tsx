import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";

interface CompanyScore {
  envScore: number;
  socialScore: number;
  govScore: number;
  totalScore: number;
  weights: {
    env: number;
    social: number;
    gov: number;
  };
}

interface DeptScore {
  id: string;
  name: string;
  code: string;
  envScore: number;
  socialScore: number;
  govScore: number;
  totalScore: number;
  breakdown: {
    emissionsKg: number;
    goalCompletionRate: number;
    femaleRatioPct: number;
    avgTrainingHours: number;
    openComplianceIssues: number;
  };
}

interface ScoringData {
  company: CompanyScore;
  departments: DeptScore[];
}

export default function EsgScoringPage() {
  const [data, setData] = useState<ScoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ data: ScoringData }>("/scoring/breakdown")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-sm text-gray-400 py-12">Calculating weighted ESG scores...</div>;
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⭐ ESG Scoring Engine</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time ESG scoring breakdown company-wide and across departments based on active ESG settings weightage.</p>
      </div>

      {/* Main Score & Weights Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overall Score */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">EcoSphere Total Score</p>
            <p className="text-5xl font-black text-brand-600 mt-2">{data.company.totalScore} / 100</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
            Weighted aggregate based on Settings weights.
          </div>
        </div>

        {/* Breakdown scores */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">ESG Component Breakdowns</h2>
          <div className="space-y-3">
            {[
              { label: "Environmental Score (E)", val: data.company.envScore, weight: data.company.weights.env, color: "bg-green-500" },
              { label: "Social Score (S)", val: data.company.socialScore, weight: data.company.weights.social, color: "bg-blue-500" },
              { label: "Governance Score (G)", val: data.company.govScore, weight: data.company.weights.gov, color: "bg-purple-500" }
            ].map((comp, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{comp.label} (Weight: {comp.weight}%)</span>
                  <span className="font-bold">{comp.val}/100</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2.5 rounded-full transition-all ${comp.color}`}
                    style={{ width: `${comp.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Scores Table */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Department Standing & Scores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Code</th>
                <th className="py-2.5">Env Score (E)</th>
                <th className="py-2.5">Social Score (S)</th>
                <th className="py-2.5">Gov Score (G)</th>
                <th className="py-2.5 font-bold text-brand-600">Total ESG Score</th>
                <th className="py-2.5">Key Metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {data.departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-900">{dept.name}</td>
                  <td className="py-3 font-mono">{dept.code}</td>
                  <td className="py-3 font-semibold text-green-600">{dept.envScore}</td>
                  <td className="py-3 font-semibold text-blue-600">{dept.socialScore}</td>
                  <td className="py-3 font-semibold text-purple-600">{dept.govScore}</td>
                  <td className="py-3 font-bold text-lg text-brand-600">{dept.totalScore}</td>
                  <td className="py-3 text-xs text-gray-400">
                    📉 {dept.breakdown.emissionsKg.toFixed(1)}kg CO₂ · 🎯 {dept.breakdown.goalCompletionRate}% Goals · 👥 {dept.breakdown.femaleRatioPct}% Female · 📚 {dept.breakdown.avgTrainingHours}h Training · ⚠️ {dept.breakdown.openComplianceIssues} Issues
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
