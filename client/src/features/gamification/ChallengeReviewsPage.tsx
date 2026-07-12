import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

interface Submission {
  id: string;
  proofUrl?: string;
  proofNote?: string;
  status: string;
  submittedAt: string;
  user: { name: string };
  challenge: { title: string; xpReward: number; pointsReward: number };
}

export default function ChallengeReviewsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Submission[] }>("/gamification/participations");
      setSubmissions(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await api.patch<{ message: string }>(`/gamification/participations/${id}/review`, {
        status,
        reviewNote: reviewNote[id] || undefined
      });
      alert(res.data.message || `Submission ${status.toLowerCase()}`);
      fetchSubmissions();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const isElevated = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📝 Challenge Reviews</h1>
        <p className="text-sm text-gray-500">Approve or reject employee green challenge completions to reward XP and Points.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">No submissions to review.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Challenge</th>
                <th className="px-4 py-3 text-left">Proof Description</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted Date</th>
                {isElevated && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{s.user.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{s.challenge.title}</p>
                    <p className="text-[10px] text-gray-400">⚡ {s.challenge.xpReward} XP · 🎁 {s.challenge.pointsReward} Pts</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-800">{s.proofNote || "No notes"}</p>
                    {s.proofUrl && (
                      <a href={s.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline block mt-0.5">
                        Open Proof Link
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      s.status === "APPROVED" ? "bg-green-50 text-green-700" :
                      s.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</td>
                  {isElevated && (
                    <td className="px-4 py-3">
                      {s.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add comment..."
                            value={reviewNote[s.id] || ""}
                            onChange={(e) => setReviewNote(prev => ({ ...prev, [s.id]: e.target.value }))}
                            className="rounded border border-gray-200 px-2 py-1 text-xs outline-none"
                          />
                          <button
                            onClick={() => handleReview(s.id, "APPROVED")}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(s.id, "REJECTED")}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Completed Review</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
